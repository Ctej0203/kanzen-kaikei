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
import { Sparkles, Info, Gift, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getItemImage } from "@/lib/itemImages";

interface GachaResult {
  item_id: string;
  rarity: string;
  is_new: boolean;
  name?: string;
  description?: string;
  image_url?: string;
}

export default function Gacha() {
  const navigate = useNavigate();
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
        image_url: item?.image_url,
      };
    });

    setResults(enrichedResults);
    setShowResults(true);
  };

  const remainingForSSR = Math.max(0, 50 - (pity?.current_count || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 via-purple-900 to-indigo-950 p-6 relative overflow-hidden animate-gradient">
      {/* 背景のアニメーション付きグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-yellow-500/20 animate-pulse pointer-events-none" />
      
      {/* キラキラエフェクト（強化版） */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Sparkles
              className="text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
              size={12 + Math.random() * 20}
            />
          </div>
        ))}
      </div>
      
      {/* 光の粒子エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* ホームボタン */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>

        {/* ヘッダー */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse">
            <Gift className="inline mr-2 animate-wiggle" />
            ✨キュアガチャ✨
          </h1>
          <p className="text-xl text-yellow-200 drop-shadow-lg">夢のアイテムをゲットしよう！</p>
        </div>

        {/* ステータス */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="p-6 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl border-2 border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white/90">所持コイン</span>
              <div className="flex items-center gap-2">
                <CoinIcon size={36} />
                <span className="text-4xl font-bold text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]">{totalCoins}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-xl border-2 border-yellow-300/30 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white/90">SSR確定まで</span>
              <div className="text-4xl font-bold text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-pulse">
                あと {remainingForSSR} 回
              </div>
            </div>
          </Card>
        </div>

        {/* ガチャボタン */}
        <div className="space-y-6 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="p-10 bg-gradient-to-r from-purple-600/40 to-pink-600/40 backdrop-blur-xl border-2 border-purple-300/30 shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.8)] transition-all hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <div className="flex items-center justify-between relative z-10">
              <div className="text-white">
                <h3 className="text-3xl font-bold mb-2 drop-shadow-lg">🎯 単発ガチャ</h3>
                <p className="text-white/90 text-lg">運試しに1回引く</p>
              </div>
              <Button
                size="lg"
                onClick={() => handleGacha(1)}
                disabled={gachaMutation.isPending || totalCoins < 80}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white min-w-[240px] h-16 text-xl font-bold shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:shadow-[0_0_50px_rgba(236,72,153,0.9)] transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
              >
                <CoinIcon size={28} className="mr-2" />
                80コイン
              </Button>
            </div>
          </Card>

          <Card className="p-10 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all hover:scale-[1.02] relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.6)] hover:shadow-[0_0_70px_rgba(251,191,36,0.9)] border-4 border-yellow-200/50">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -top-1 -right-1">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-bl-2xl rounded-tr-lg text-lg font-bold shadow-lg animate-bounce">
                🎉 超お得！
              </div>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-white">
                <h3 className="text-4xl font-bold mb-2 drop-shadow-lg">⭐ 11連ガチャ</h3>
                <p className="text-white/95 text-xl font-semibold">11回まとめて引ける！</p>
                <p className="text-lg text-white/90 mt-2 font-bold">💰 80コイン分お得！</p>
              </div>
              <Button
                size="lg"
                onClick={() => handleGacha(11)}
                disabled={gachaMutation.isPending || totalCoins < 800}
                className="bg-white text-orange-600 hover:bg-gray-50 min-w-[240px] h-20 text-2xl font-black shadow-[0_0_40px_rgba(255,255,255,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,1)] transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
              >
                <CoinIcon size={32} className="mr-2" />
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

      {/* 結果表示ダイアログ（ゴージャス版） */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-950 via-pink-950 to-purple-900 border-4 border-yellow-300/50 shadow-[0_0_80px_rgba(251,191,36,0.6)]">
          <DialogHeader>
            <DialogTitle className="text-4xl text-center text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)] font-bold animate-pulse">
              ✨🎉 ガチャ結果 🎉✨
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {results.map((result, index) => (
              <Card
                key={index}
                className={`p-4 text-center relative overflow-hidden animate-scale-in border-4 ${
                  result.rarity === 'SSR' 
                    ? 'bg-gradient-to-br from-yellow-200 via-orange-200 to-yellow-300 border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.8)]' :
                  result.rarity === 'SR' 
                    ? 'bg-gradient-to-br from-blue-200 via-purple-200 to-blue-300 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 
                    'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {result.rarity === 'SSR' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent animate-shimmer" />
                )}
                
                {result.is_new && (
                  <div className="mb-2 relative z-10">
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
                      ✨ NEW! ✨
                    </span>
                  </div>
                )}
                
                <div className={`aspect-square bg-white/80 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden ${
                  result.rarity === 'SSR' ? 'animate-pulse' : ''
                }`}>
                  {result.rarity === 'SSR' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-orange-300/30 to-yellow-300/30 animate-spin-slow" />
                      {[...Array(8)].map((_, i) => (
                        <Sparkles
                          key={i}
                          className="absolute text-yellow-400 animate-ping"
                          style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                          size={16}
                        />
                      ))}
                    </>
                  )}
                  {result.image_url && getItemImage(result.image_url) ? (
                    <img 
                      src={getItemImage(result.image_url)!} 
                      alt={result.name}
                      className={`w-full h-full object-contain p-2 relative z-10 ${result.rarity === 'SSR' ? 'animate-wiggle' : ''}`}
                    />
                  ) : (
                    <span className={`text-6xl relative z-10 ${result.rarity === 'SSR' ? 'animate-wiggle' : ''}`}>
                      {result.rarity === 'SSR' && '🌟'}
                      {result.rarity === 'SR' && '⭐'}
                      {result.rarity === 'R' && '✨'}
                    </span>
                  )}
                </div>
                
                <div className="relative z-10">
                  <RarityBadge rarity={result.rarity as any} />
                  <p className={`font-bold mt-2 ${
                    result.rarity === 'SSR' ? 'text-orange-900 text-lg' :
                    result.rarity === 'SR' ? 'text-blue-900' : 'text-gray-700'
                  }`}>{result.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{result.description}</p>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowResults(false)} 
            className="w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
          >
            閉じる
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
