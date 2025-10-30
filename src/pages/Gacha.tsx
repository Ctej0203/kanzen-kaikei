import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CoinIcon } from "@/components/CoinIcon";
import { RarityBadge } from "@/components/RarityBadge";
import { useCoins } from "@/hooks/useCoins";
import { useGacha } from "@/hooks/useGacha";
import { Sparkles, Info, Gift } from "lucide-react";

interface GachaResult {
  item_id: string;
  rarity: string;
  is_new: boolean;
  name?: string;
  description?: string;
}

export default function Gacha() {
  const { totalCoins } = useCoins();
  const gachaMutation = useGacha();
  const [results, setResults] = useState<GachaResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { data: pity } = useQuery({
    queryKey: ["gacha-pity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("gacha_pity")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: allItems } = useQuery({
    queryKey: ["all-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const handleGacha = async (rollCount: 1 | 11) => {
    const result = await gachaMutation.mutateAsync(rollCount);
    
    // アイテム詳細を取得
    const enrichedResults = result.map(r => {
      const item = allItems?.find(item => item.id === r.item_id);
      return {
        ...r,
        name: item?.name,
        description: item?.description,
      };
    });

    setResults(enrichedResults);
    setShowResults(true);
  };

  const remainingForSSR = Math.max(0, 50 - (pity?.current_count || 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 p-6 relative overflow-hidden">
      {/* キラキラエフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-yellow-300 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6,
            }}
            size={24}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Gift className="inline mr-2" />
            キュアガチャ
          </h1>
          <p className="text-white/80">かわいいアイテムをゲット！</p>
        </div>

        {/* ステータス */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-6 bg-white/10 backdrop-blur text-white">
            <div className="flex items-center justify-between">
              <span className="text-lg">所持コイン</span>
              <div className="flex items-center gap-2">
                <CoinIcon size={32} />
                <span className="text-3xl font-bold">{totalCoins}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur text-white">
            <div className="flex items-center justify-between">
              <span className="text-lg">SSR確定まで</span>
              <div className="text-3xl font-bold text-yellow-300">
                あと {remainingForSSR} 回
              </div>
            </div>
          </Card>
        </div>

        {/* ガチャボタン */}
        <div className="space-y-4 mb-8">
          <Card className="p-8 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">単発ガチャ</h3>
                <p className="text-white/80">1回引く</p>
              </div>
              <Button
                size="lg"
                onClick={() => handleGacha(1)}
                disabled={gachaMutation.isPending || totalCoins < 80}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white min-w-[200px]"
              >
                <CoinIcon size={24} className="mr-2" />
                80コイン
              </Button>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-colors relative">
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              お得！
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">11連ガチャ</h3>
                <p className="text-white/90">11回まとめて引く</p>
                <p className="text-sm text-white/80 mt-1">※ 80コイン分お得</p>
              </div>
              <Button
                size="lg"
                onClick={() => handleGacha(11)}
                disabled={gachaMutation.isPending || totalCoins < 800}
                className="bg-white text-orange-600 hover:bg-gray-100 min-w-[200px] font-bold"
              >
                <CoinIcon size={24} className="mr-2" />
                800コイン
              </Button>
            </div>
          </Card>
        </div>

        {/* 確率表示ボタン */}
        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Info className="mr-2" size={16} />
                排出確率と天井システム
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>排出確率とアイテム一覧</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 確率表示 */}
                <div>
                  <h3 className="font-semibold mb-3">レアリティ別排出確率</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RarityBadge rarity="SSR" />
                        <span className="font-semibold">SSR</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">3%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RarityBadge rarity="SR" />
                        <span className="font-semibold">SR</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">12%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RarityBadge rarity="R" />
                        <span className="font-semibold">R</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-600">85%</span>
                    </div>
                  </div>
                </div>

                {/* 天井システム */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-purple-900">天井システム</h3>
                  <p className="text-sm text-purple-800">
                    50回ガチャを引いてもSSRが出なかった場合、
                    51回目は必ずSSRが排出されます。
                    SSRを獲得するとカウントはリセットされます。
                  </p>
                </div>

                {/* アイテム一覧 */}
                <div>
                  <h3 className="font-semibold mb-3">アイテム一覧</h3>
                  {['SSR', 'SR', 'R'].map(rarity => (
                    <div key={rarity} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <RarityBadge rarity={rarity as any} />
                        <span className="font-semibold">{rarity} アイテム</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {allItems
                          ?.filter(item => item.rarity === rarity && !item.is_default)
                          .map(item => (
                            <div key={item.id} className="p-3 bg-muted rounded-lg">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 結果表示ダイアログ */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">ガチャ結果</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4">
            {results.map((result, index) => (
              <Card
                key={index}
                className={`p-4 text-center ${
                  result.rarity === 'SSR' ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                  result.rarity === 'SR' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                {result.is_new && (
                  <div className="mb-2">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      NEW!
                    </span>
                  </div>
                )}
                
                <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-6xl">
                    {result.rarity === 'SSR' && '🌟'}
                    {result.rarity === 'SR' && '⭐'}
                    {result.rarity === 'R' && '✨'}
                  </span>
                </div>
                
                <RarityBadge rarity={result.rarity as any} />
                <p className="font-semibold mt-2">{result.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
              </Card>
            ))}
          </div>
          
          <Button onClick={() => setShowResults(false)} className="w-full">
            閉じる
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
