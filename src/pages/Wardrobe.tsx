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
import { useCharacter } from "@/hooks/useCharacter";

// Assets imports
import curaCharacter from "@/assets/cura-character-transparent.png";
import curaDoctor from "@/assets/cura-doctor.jpg";
import curaEnergetic from "@/assets/cura-energetic.png";
import curaGentle from "@/assets/cura-gentle.png";
import curaHappy from "@/assets/cura-happy.png";
import lunoCharacter from "@/assets/luno-character.png";
import lunoFish from "@/assets/luno-fish.png";
import lunoKomatsuna from "@/assets/luno-komatsuna.png";
import lunoMilk from "@/assets/luno-milk.png";
import lunoNatto from "@/assets/luno-natto.png";
import lunoSanta from "@/assets/luno-santa.png";
import lunoTonakai from "@/assets/luno-tonakai.png";
import suuCharacter from "@/assets/suu-character.png";
import suuDoctor from "@/assets/suu-doctor.png";
import suuEdamame from "@/assets/suu-edamame.png";
import suuMacho from "@/assets/suu-macho.png";
import suuPampukinn from "@/assets/suu-pampukinn.png";
import suuStrawberry from "@/assets/suu-strawberry.png";

// 画像マップ
const characterImages: Record<string, string> = {
  "cura-default": curaCharacter,
  "cura-doctor": curaDoctor,
  "cura-energetic": curaEnergetic,
  "cura-gentle": curaGentle,
  "cura-happy": curaHappy,
  "luno-default": lunoCharacter,
  "luno-fish": lunoFish,
  "luno-komatsuna": lunoKomatsuna,
  "luno-milk": lunoMilk,
  "luno-natto": lunoNatto,
  "luno-santa": lunoSanta,
  "luno-tonakai": lunoTonakai,
  "suu-default": suuCharacter,
  "suu-doctor": suuDoctor,
  "suu-edamame": suuEdamame,
  "suu-macho": suuMacho,
  "suu-pampukinn": suuPampukinn,
  "suu-strawberry": suuStrawberry,
};

type Category = "outfit" | "accessory" | "background" | "effect";

export default function Wardrobe() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>("outfit");
  const queryClient = useQueryClient();
  const { selectedCharacter } = useCharacter();

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

  // 装備中のアイテムの画像を取得
  const getEquippedImage = () => {
    const equippedOutfit = equippedItems.find(item => item.items?.category === 'outfit');
    if (equippedOutfit?.items?.image_url) {
      return characterImages[equippedOutfit.items.image_url] || selectedCharacter.image;
    }
    return selectedCharacter.image;
  };

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
                  <div className="absolute inset-0 opacity-30">
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200" />
                  </div>
                )}
                
                {/* キャラクター画像 */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img 
                    src={getEquippedImage()} 
                    alt={selectedCharacter.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* エフェクト */}
                {equippedItems.find(item => item.items?.category === 'effect') && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <Sparkles
                        key={i}
                        className="absolute text-yellow-400 animate-float"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                        size={24}
                      />
                    ))}
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
                        
                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-2 flex items-center justify-center p-2">
                          {item.category === 'outfit' && item.image_url && characterImages[item.image_url] ? (
                            <img 
                              src={characterImages[item.image_url]} 
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-4xl">
                              {item.category === 'outfit' && '👗'}
                              {item.category === 'accessory' && '🎀'}
                              {item.category === 'background' && '🌸'}
                              {item.category === 'effect' && '✨'}
                            </span>
                          )}
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
