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
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            ← 戻る
          </Button>
          <h1 className="text-xl font-bold">オンライン診療</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Main Description */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">オンラインで専門家に相談できます</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              メンタルヘルスの専門家とオンラインでつながり、ビデオ通話やチャットで相談できます。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              つらい気持ち、眠れない、ストレスが強いときなどにご利用ください。
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
              <p className="text-sm text-destructive">
                ※ 緊急の危険がある場合は、オンライン診療ではなくお住まいの地域の緊急窓口に連絡してください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Steps */}
        <div>
          <h2 className="text-xl font-semibold mb-4 px-2">ご利用の流れ</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={index} className="border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-shadow"
            size="lg"
          >
            <Video className="w-5 h-5 mr-2" />
            今すぐ相談できる先生を探す
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg"
            size="lg"
          >
            <Clock className="w-5 h-5 mr-2" />
            日時を指定して予約する
          </Button>
        </div>

        {/* Privacy & Safety */}
        <Card className="bg-secondary/30 border-secondary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">安心してご利用いただけます</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                プライバシーは厳重に守られます
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                相談内容は第三者に共有されません
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
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
