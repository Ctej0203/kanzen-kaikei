import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const MoodLogger = () => {
  const [moodScore, setMoodScore] = useState([5]);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const { error } = await supabase
        .from("symptom_records")
        .insert({
          user_id: user.id,
          mood_score: moodScore[0],
          memo: memo || null,
        });

      if (error) throw error;

      toast({
        title: "記録しました",
        description: "今日の調子を記録しました",
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
        <CardTitle className="text-xl font-bold">📝 記録する</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-lg">調子: {moodScore[0]}</span>
            <span className="text-muted-foreground">0: とても悪い - 10: とても良い</span>
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
          <Textarea
            placeholder="メモ（任意）"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
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