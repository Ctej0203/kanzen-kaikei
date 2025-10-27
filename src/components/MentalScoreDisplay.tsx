import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import curaHappy from "@/assets/cura-happy.png";
import curaGentle from "@/assets/cura-gentle.png";
import curaCharacter from "@/assets/cura-character.png";

export const MentalScoreDisplay = () => {
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestComment, setLatestComment] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestScore();
  }, []);

  const fetchLatestScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("symptom_records")
        .select("ai_score, ai_comment")
        .eq("user_id", user.id)
        .not("ai_score", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setLatestScore(data[0].ai_score);
        setLatestComment(data[0].ai_comment || "");
      }
    } catch (error) {
      console.error("スコア取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCharacterImage = () => {
    if (latestScore === null) return curaCharacter;
    if (latestScore >= 70) return curaHappy;
    if (latestScore >= 40) return curaGentle;
    return curaCharacter;
  };

  const getScoreColor = () => {
    if (latestScore === null) return "hsl(var(--muted))";
    if (latestScore >= 70) return "hsl(var(--success))";
    if (latestScore >= 40) return "hsl(var(--accent))";
    return "hsl(var(--primary))";
  };

  if (loading) {
    return (
      <Card className="w-full shadow-lg gradient-card border-2 border-accent/20">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">読み込み中...</div>
        </CardContent>
      </Card>
    );
  }

  if (latestScore === null) {
    return (
      <Card className="w-full shadow-lg gradient-card border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold">💖 今日のメンタルスコア</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img src={curaCharacter} alt="Cura" className="w-32 h-32 animate-bounce-soft" />
          </div>
          <p className="text-center text-muted-foreground">
            日記を記録すると、AIがあなたの心の状態を分析してスコアを表示します✨
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold">💖 今日のメンタルスコア</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* キャラクター */}
        <div className="flex justify-center">
          <img 
            src={getCharacterImage()} 
            alt="Cura" 
            className="w-32 h-32 animate-bounce-soft"
          />
        </div>

        {/* スコア円グラフ風表示 */}
        <div className="relative">
          <div 
            className="mx-auto w-40 h-40 rounded-full flex items-center justify-center"
            style={{ 
              background: `conic-gradient(${getScoreColor()} ${latestScore * 3.6}deg, hsl(var(--muted)) 0deg)` 
            }}
          >
            <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: getScoreColor() }}>
                  {latestScore}
                </div>
                <div className="text-sm text-muted-foreground">点</div>
              </div>
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <Progress value={latestScore} className="h-3" />

        {/* AIコメント */}
        <div className="bg-secondary/50 p-4 rounded-lg">
          <p className="text-center text-foreground leading-relaxed">
            {latestComment}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
