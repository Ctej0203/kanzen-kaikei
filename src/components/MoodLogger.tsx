import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useRecordStreak } from "@/hooks/useRecordStreak";
import { UnifiedCalendar } from "./UnifiedCalendar";
import { useCharacter } from "@/hooks/useCharacter";
import { useCharacterAffection } from "@/hooks/useCharacterAffection";
import { AffectionIncreaseAnimation } from "./AffectionIncreaseAnimation";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { moodExpressions } from "@/lib/moodExpressions";

interface MoodLoggerProps {
  onRecordSuccess?: () => void;
}

export const MoodLogger = ({ onRecordSuccess }: MoodLoggerProps = {}) => {
  const [moodScore, setMoodScore] = useState([5]);
  const [moodExpression, setMoodExpression] = useState<string>("normal");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAffectionAnimation, setShowAffectionAnimation] = useState(false);
  const { refetch: refetchStreak } = useRecordStreak();
  const { selectedCharacter } = useCharacter();
  const { increaseAffection } = useCharacterAffection();
  const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceRecording();

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const text = await stopRecording();
        setMemo(prev => prev ? `${prev}\n${text}` : text);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      await startRecording();
    }
  };

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
            body: { 
              user_id: user.id,
              mood_score: moodScore[0],
              memo,
              character_id: selectedCharacter.id,
            }
          });
          
          if (functionError) {
            console.error("AI分析エラー:", functionError);
          } else if (functionData && !functionData.error) {
            aiScore = functionData.score;
            aiComment = functionData.comment;
            console.log("AI分析結果:", { aiScore, aiComment });
          } else if (functionData?.error) {
            console.error("AI分析エラー:", functionData.error);
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
          mood_expression: moodExpression,
          memo: memo || null,
          ai_score: aiScore,
          ai_comment: aiComment,
        });

      if (error) throw error;

      // ストリークデータを更新
      await refetchStreak();

      // Increase affection for current character (+2 for diary record)
      await increaseAffection.mutateAsync({
        characterId: selectedCharacter.id,
        amount: 2,
      });

      setShowAffectionAnimation(true);

      toast({
        title: "記録しました",
        description: aiScore ? `メンタルスコア: ${aiScore}点` : "今日の調子を記録しました",
      });
      
      setMoodScore([5]);
      setMoodExpression("normal");
      setMemo("");
      
      // Show affection animation first, then calendar
      setTimeout(() => {
        setShowCalendar(true);
      }, 2000);
      
      onRecordSuccess?.();
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
    <>
      {showAffectionAnimation && (
        <AffectionIncreaseAnimation
          amount={2}
          onComplete={() => setShowAffectionAnimation(false)}
        />
      )}

      <UnifiedCalendar 
        open={showCalendar} 
        onOpenChange={setShowCalendar}
        defaultTab="record"
      />
      
      <Card className="w-full shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold">今日の気持ちを記録しよう</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">今日の気分</label>
            <div className="flex justify-center gap-4">
              {moodExpressions.map((expression) => (
                <button
                  key={expression.id}
                  type="button"
                  onClick={() => setMoodExpression(expression.id)}
                  className={`relative w-20 h-20 rounded-full transition-all hover:scale-105 ${
                    moodExpression === expression.id
                      ? "ring-4 ring-primary shadow-lg"
                      : "ring-2 ring-border hover:ring-accent"
                  }`}
                  aria-label={expression.label}
                >
                  <img
                    src={expression.image}
                    alt={expression.label}
                    className="w-full h-full object-cover"
                  />
                  {moodExpression === expression.id && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap">
                      {expression.label}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">今日の日記（AIが分析します）</label>
            <div className="relative">
              <Textarea
                placeholder="今日はどんな1日でしたか？嬉しかったこと、辛かったこと、何でも書いてみてね..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={5}
                className="resize-none border-2 pr-12"
                disabled={isProcessing}
              />
              <Button
                type="button"
                size="icon"
                variant={isRecording ? "destructive" : "secondary"}
                className="absolute right-2 top-2"
                onClick={handleVoiceInput}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
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
      <UnifiedCalendar 
        open={showCalendar} 
        onOpenChange={setShowCalendar}
        defaultTab="record"
      />
    </>
  );
};