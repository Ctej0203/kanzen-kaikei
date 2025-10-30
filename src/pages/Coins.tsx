import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CoinIcon } from "@/components/CoinIcon";
import { useCoins } from "@/hooks/useCoins";
import { Button } from "@/components/ui/button";
import { Gift, ShoppingCart, Clock } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function Coins() {
  const { totalCoins, freeCoins, paidCoins, isLoading } = useCoins();

  const { data: transactions } = useQuery({
    queryKey: ["coin-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const earnTransactions = transactions?.filter(t => t.type === "earn") || [];

  const coinPacks = [
    { amount: 100, price: 120, bonus: 0 },
    { amount: 550, price: 600, bonus: 50 },
    { amount: 1200, price: 1200, bonus: 200 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          <CoinIcon size={40} className="inline mr-2" />
          コイン
        </h1>

        {/* 残高表示 */}
        <Card className="p-8 mb-8 bg-white/80 backdrop-blur text-center">
          <h2 className="text-lg text-muted-foreground mb-2">現在の残高</h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <CoinIcon size={48} />
            <span className="text-6xl font-bold text-primary">
              {isLoading ? "..." : totalCoins.toLocaleString()}
            </span>
          </div>
          
          <div className="flex gap-4 justify-center text-sm text-muted-foreground">
            <div>
              <span className="text-green-600 font-semibold">無料: </span>
              {freeCoins.toLocaleString()}
            </div>
            <div>
              <span className="text-purple-600 font-semibold">課金: </span>
              {paidCoins.toLocaleString()}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="earn" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earn">
              <Gift className="mr-2" size={16} />
              獲得履歴
            </TabsTrigger>
            <TabsTrigger value="purchase">
              <ShoppingCart className="mr-2" size={16} />
              購入
            </TabsTrigger>
          </TabsList>

          {/* 獲得履歴タブ */}
          <TabsContent value="earn" className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4">コイン獲得履歴</h3>
              
              {earnTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  まだ履歴がありません
                </p>
              ) : (
                <div className="space-y-3">
                  {earnTransactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={20} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getSourceLabel(transaction.source)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), "M月d日 HH:mm", { locale: ja })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CoinIcon size={24} />
                        <span className="text-2xl font-bold text-green-600">
                          +{transaction.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* 購入タブ */}
          <TabsContent value="purchase" className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4">コインパック</h3>
              
              <div className="space-y-4">
                {coinPacks.map((pack, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <CoinIcon size={48} />
                          {pack.bonus > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                              +{pack.bonus}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{pack.amount}コイン</p>
                          {pack.bonus > 0 && (
                            <p className="text-sm text-green-600 font-semibold">
                              ボーナス {pack.bonus}コイン
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button size="lg" className="min-w-[120px]">
                        ¥{pack.price}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <p className="text-sm text-muted-foreground text-center mt-6">
                ※ 決済はStripeで安全に処理されます
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    breathing: "呼吸法完了",
    mood_log: "気分記録",
    daily_login: "ログインボーナス",
    gacha_duplicate: "重複アイテム",
    stripe: "購入",
  };
  return labels[source] || source;
}
