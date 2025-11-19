import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RarityBadge } from "@/components/RarityBadge";
import { Lock, Sparkles, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Category = "outfit" | "accessory" | "background" | "effect";

export default function Wardrobe() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>("outfit");
  const queryClient = useQueryClient();

  const { data: userItems, isLoading } = useQuery({
    queryKey: ["user-items"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_items")
        .select(`
          *,
          items:item_id (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: allItems } = useQuery({
    queryKey: ["all-items", selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("category", selectedCategory);

      if (error) throw error;
      return data;
    },
  });

  const equipMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // まず、同じカテゴリーの他のアイテムを外す
      const { error: unequipError } = await supabase
        .from("user_items")
        .update({ is_equipped: false })
        .eq("user_id", user.id)
        .in("item_id", 
          allItems
            ?.filter(item => item.category === selectedCategory)
            .map(item => item.id) || []
        );

      if (unequipError) throw unequipError;

      // 選択したアイテムを装備
      const { error: equipError } = await supabase
        .from("user_items")
        .update({ is_equipped: true })
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (equipError) throw equipError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      toast.success("着替えました！");
    },
  });

  const equippedItems = userItems?.filter(item => item.is_equipped) || [];
  const ownedItemIds = new Set(userItems?.map(item => item.item_id) || []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ホームボタン */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-secondary/50"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          <Sparkles className="inline mr-2" />
          着せ替え
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* カテゴリータブ */}
          <div className="lg:col-span-2">
            <Tabs
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as Category)}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto space-y-2">
                <TabsTrigger value="outfit" className="w-full">衣装</TabsTrigger>
                <TabsTrigger value="accessory" className="w-full">アクセサリー</TabsTrigger>
                <TabsTrigger value="background" className="w-full">背景</TabsTrigger>
                <TabsTrigger value="effect" className="w-full">エフェクト</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* プレビュー */}
          <div className="lg:col-span-5">
            <Card className="p-8 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4 text-center">プレビュー</h2>
              <div className="relative aspect-square bg-gradient-to-b from-purple-100 to-pink-100 rounded-lg overflow-hidden">
                {/* 背景 */}
                {equippedItems.find(item => item.items?.category === 'background') && (
                  <div className="absolute inset-0 opacity-50">
                    <div className="w-full h-full bg-blue-200" />
                  </div>
                )}
                
                {/* Curaちゃん（プレースホルダー） */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-pink-300 rounded-full flex items-center justify-center">
                    <span className="text-6xl">👧</span>
                  </div>
                </div>

                {/* エフェクト */}
                {equippedItems.find(item => item.items?.category === 'effect') && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full animate-pulse">✨</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">装備中:</h3>
                {equippedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <RarityBadge rarity={item.items?.rarity as any} />
                    <span>{item.items?.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* アイテムグリッド */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-white/80 backdrop-blur">
              <h2 className="text-2xl font-semibold mb-4">アイテム一覧</h2>
              
              {isLoading ? (
                <p className="text-center text-muted-foreground">読み込み中...</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {allItems?.map(item => {
                    const isOwned = ownedItemIds.has(item.id);
                    const isEquipped = equippedItems.some(ui => ui.item_id === item.id);

                    return (
                      <Card
                        key={item.id}
                        className={`relative p-4 cursor-pointer transition-all hover:scale-105 ${
                          isEquipped ? "ring-2 ring-primary" : ""
                        } ${!isOwned ? "opacity-50" : ""}`}
                        onClick={() => isOwned && equipMutation.mutate(item.id)}
                      >
                        {!isOwned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <Lock className="text-white" size={32} />
                          </div>
                        )}
                        
                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-4xl">
                            {item.category === 'outfit' && '👗'}
                            {item.category === 'accessory' && '🎀'}
                            {item.category === 'background' && '🌸'}
                            {item.category === 'effect' && '✨'}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <RarityBadge rarity={item.rarity as any} />
                          <p className="text-sm font-medium truncate">{item.name}</p>
                        </div>
                        
                        {isEquipped && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                              装備中
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
