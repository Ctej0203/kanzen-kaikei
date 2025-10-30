import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/PremiumBadge";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Crown, Check, MessageCircle, Sparkles, TrendingUp, Headphones } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function Premium() {
  const { isPremium, plan, periodEnd } = usePremiumStatus();

  const features = [
    { icon: <MessageCircle />, title: "AIメッセージ無制限", description: "Curaといつでも何度でもおしゃべりできます" },
    { icon: <Sparkles />, title: "限定アイテムアクセス", description: "プレミアム会員だけの特別なアイテムをゲット" },
    { icon: <TrendingUp />, title: "詳細分析レポート", description: "あなたのメンタルヘルスを深く分析" },
    { icon: <Headphones />, title: "優先サポート", description: "困ったときは優先的にサポート" },
  ];

  const plans = [
    {
      id: "premium_monthly",
      name: "月額プラン",
      price: 480,
      period: "月",
      description: "気軽に始められる",
    },
    {
      id: "premium_yearly",
      name: "年額プラン",
      price: 4800,
      period: "年",
      description: "2ヶ月分お得！",
      badge: "おすすめ",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヒーローセクション */}
        <div className="text-center mb-12 text-white">
          <Crown className="mx-auto mb-4" size={64} />
          <h1 className="text-5xl font-bold mb-4">Curely Premium</h1>
          <p className="text-xl text-white/80">
            もっと充実したセルフケアを、あなたに
          </p>
        </div>

        {/* 現在のステータス */}
        {isPremium && (
          <Card className="p-8 mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <PremiumBadge />
                  <h2 className="text-2xl font-bold">プレミアム会員</h2>
                </div>
                <p className="text-white/90">
                  次回更新日: {periodEnd && format(new Date(periodEnd), "yyyy年M月d日", { locale: ja })}
                </p>
                <p className="text-sm text-white/70 mt-1">
                  プラン: {plan === "premium_monthly" ? "月額プラン" : "年額プラン"}
                </p>
              </div>
              <Button variant="outline" className="bg-white text-purple-600 hover:bg-gray-100">
                プランを管理
              </Button>
            </div>
          </Card>
        )}

        {/* 特典一覧 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            プレミアム特典
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary rounded-lg text-white">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 価格表 */}
        {!isPremium && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              プランを選ぶ
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((planOption) => (
                <Card
                  key={planOption.id}
                  className={`p-8 relative ${
                    planOption.badge
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-yellow-300"
                      : "bg-white/10 backdrop-blur border-white/20"
                  }`}
                >
                  {planOption.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        {planOption.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className={planOption.badge ? "text-white" : "text-white"}>
                    <h3 className="text-2xl font-bold mb-2">{planOption.name}</h3>
                    <p className={`text-sm mb-4 ${planOption.badge ? "text-white/90" : "text-white/70"}`}>
                      {planOption.description}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold">¥{planOption.price.toLocaleString()}</span>
                      <span className="text-lg">/ {planOption.period}</span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check size={20} className={planOption.badge ? "text-white" : "text-green-400"} />
                          <span className="text-sm">{feature.title}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full ${
                        planOption.badge
                          ? "bg-white text-orange-600 hover:bg-gray-100"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                      size="lg"
                    >
                      <Crown className="mr-2" size={20} />
                      このプランで登録
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* よくある質問 */}
        <Card className="p-8 bg-white/10 backdrop-blur border-white/20 text-white">
          <h2 className="text-2xl font-bold mb-6">よくある質問</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Q. いつでも解約できますか？</h3>
              <p className="text-white/80 text-sm">
                はい、いつでも解約可能です。解約後も期間終了まで特典をご利用いただけます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Q. 決済方法は何がありますか？</h3>
              <p className="text-white/80 text-sm">
                クレジットカード（Visa、Mastercard、JCB、American Express）がご利用いただけます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Q. 無料プランに戻せますか？</h3>
              <p className="text-white/80 text-sm">
                もちろんです。解約後は自動的に無料プランに戻ります。データは保持されます。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
