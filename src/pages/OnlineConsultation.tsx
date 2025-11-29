import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar, MessageSquare, Shield, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnlineConsultation = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: MessageSquare,
      title: "① 気になる症状やお悩みを選ぶ",
      description: "あなたの状態に合った専門家を見つけます"
    },
    {
      icon: Calendar,
      title: "② 医師・専門家と日時を選んで予約",
      description: "都合の良い時間を選択できます"
    },
    {
      icon: Video,
      title: "③ 予約時間になったらオンライン診療を開始",
      description: "アプリから簡単に接続できます"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-2 text-sm sm:text-base"
            size="sm"
          >
            ← 戻る
          </Button>
          <h1 className="text-lg sm:text-xl font-bold truncate">オンライン診療</h1>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl space-y-4 sm:space-y-6">
        {/* Main Description */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Video className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">オンラインで専門家に相談できます</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              メンタルヘルスの専門家とオンラインでつながり、ビデオ通話やチャットで相談できます。
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              つらい気持ち、眠れない、ストレスが強いときなどにご利用ください。
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-destructive leading-relaxed">
                ※ 緊急の危険がある場合は、オンライン診療ではなくお住まいの地域の緊急窓口に連絡してください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Steps */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 px-1 sm:px-2">ご利用の流れ</h2>
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step, index) => (
              <Card key={index} className="border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 pt-0.5 sm:pt-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 sm:pt-4">
          <Button 
            className="w-full h-12 sm:h-14 text-base sm:text-lg shadow-lg hover:shadow-xl transition-shadow"
            size="lg"
            onClick={() => navigate("/consultation-booking")}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            日時を指定して予約する
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 sm:h-14 text-base sm:text-lg"
            size="lg"
            onClick={() => navigate("/consultation-list")}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            予約一覧を見る
          </Button>
        </div>

        {/* Privacy & Safety */}
        <Card className="bg-secondary/30 border-secondary">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">安心してご利用いただけます</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3 p-4 sm:p-6">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                プライバシーは厳重に守られます
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                相談内容は第三者に共有されません
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                専門資格を持つ医師・カウンセラーのみが対応します
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnlineConsultation;
