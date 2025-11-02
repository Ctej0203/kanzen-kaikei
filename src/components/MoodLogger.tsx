import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRecordStreak } from "@/hooks/useRecordStreak";

export const MoodLogger = () => {
  const [moodScore, setMoodScore] = useState([5]);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const { refetch: refetchStreak } = useRecordStreak();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      let aiScore = null;
      let aiComment = null;

      // AI分析を実行（メモがある場合のみ）
      if (memo && memo.trim()) {
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke('analyze-diary', {
            body: { memo }
          });
          
          if (functionError) {
            console.error("AI分析エラー:", functionError);
          } else if (functionData) {
            aiScore = functionData.score;
            aiComment = functionData.comment;
          }
        } catch (aiError) {
          console.error("AI分析呼び出しエラー:", aiError);
        }
      }

      const { error } = await supabase
        .from("symptom_records")
        .insert({
          user_id: user.id,
          mood_score: moodScore[0],
          memo: memo || null,
          ai_score: aiScore,
          ai_comment: aiComment,
        });

      if (error) throw error;

      // ストリークデータを更新
      await refetchStreak();

      toast({
        title: "記録しました",
        description: aiScore ? `メンタルスコア: ${aiScore}点` : "今日の調子を記録しました",
      });
      
      setMoodScore([5]);
      setMemo("");
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold">今日の気持ちを記録しよう</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-lg">今日の調子: {moodScore[0]}</span>
            <span className="text-muted-foreground">😢 0 - 10 😊</span>
          </div>
          <Slider
            value={moodScore}
            onValueChange={setMoodScore}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">今日の日記（AIが分析します）</label>
          <Textarea
            placeholder="今日はどんな1日でしたか？嬉しかったこと、辛かったこと、何でも書いてみてね..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={5}
            className="resize-none border-2"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full shadow-lg hover:shadow-xl transition-all hover-lift font-bold"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          ✨ 記録する
        </Button>
      </CardContent>
    </Card>
  );
};