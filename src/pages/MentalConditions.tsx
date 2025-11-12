import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PremiumBadge } from "@/components/PremiumBadge";

const mentalConditionOptions = [
  { value: "depression", label: "うつ病（Depression）" },
  { value: "anxiety_disorder", label: "不安障害（Anxiety disorder）" },
  { value: "panic_disorder", label: "パニック障害（Panic disorder）" },
  { value: "ptsd", label: "PTSD（心的外傷後ストレス障害）" },
  { value: "ocd", label: "強迫性障害（OCD）" },
  { value: "bipolar_disorder", label: "双極性障害（Bipolar disorder）" },
  { value: "adhd", label: "注意欠陥・多動性障害（ADHD）" },
  { value: "asd", label: "自閉スペクトラム症（ASD）" },
  { value: "eating_disorder", label: "摂食障害（Eating disorder）" },
  { value: "sleep_disorder", label: "睡眠障害（Sleep disorder / insomnia）" },
  { value: "high_stress", label: "ストレスが強い" },
  { value: "mood_swings", label: "特に診断はないけど気分の波がある" },
  { value: "other", label: "その他" },
];

const MentalConditions = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremiumStatus();
  const [loading, setLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState("");

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const { data, error } = await supabase
        .from("profiles")
        .select("condition_types")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data?.condition_types) {
        const conditions = data.condition_types as string[];
        const otherConditions = conditions.filter(c => c.startsWith("other:"));
        const normalConditions = conditions.filter(c => !c.startsWith("other:"));
        
        setSelectedConditions(
          otherConditions.length > 0 
            ? [...normalConditions, "other"]
            : normalConditions
        );
        
        if (otherConditions.length > 0) {
          setOtherCondition(otherConditions[0].replace("other:", ""));
        }
      }
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConditionToggle = (value: string) => {
    if (!isPremium && selectedConditions.length >= 1 && !selectedConditions.includes(value)) {
      setSelectedConditions([value]);
    } else {
      setSelectedConditions((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    }
    
    if (value === "other" && selectedConditions.includes("other")) {
      setOtherCondition("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedConditions.length === 0) {
      toast({
        title: "選択してください",
        description: "少なくとも1つ選択してください",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const conditionTypes = selectedConditions.includes("other") && otherCondition
        ? [...selectedConditions.filter(c => c !== "other"), `other:${otherCondition}`]
        : selectedConditions;

      const { error } = await supabase
        .from("profiles")
        .update({ condition_types: conditionTypes })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "保存しました",
        description: "心の状態を更新しました",
      });
      navigate("/settings");
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">心の状態の編集</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto border-2 border-border/50">
          <CardHeader className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-4xl mb-2">
              <span>🌸</span>
              <span>💝</span>
              <span>✨</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              ご自身の心の状態について教えてください
            </CardTitle>
            <CardDescription className="text-lg">
              {isPremium ? (
                <span className="flex items-center justify-center gap-2">
                  当てはまるものを選んでください（複数選択可）
                  <PremiumBadge />
                </span>
              ) : (
                <span className="flex flex-col items-center gap-2">
                  <span>当てはまるものを1つ選んでください</span>
                  <span className="text-sm text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    プレミアムプランで複数選択が可能になります
                  </span>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mentalConditionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      relative flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                      ${
                        selectedConditions.includes(option.value)
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border/50 bg-card/50 hover:border-primary/30"
                      }
                    `}
                  >
                    <Checkbox
                      checked={selectedConditions.includes(option.value)}
                      onCheckedChange={() => handleConditionToggle(option.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-medium text-foreground leading-relaxed">
                        {option.label}
                      </span>
                    </div>
                    {selectedConditions.includes(option.value) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                        <span className="text-xs text-primary-foreground">✓</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {selectedConditions.includes("other") && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="otherCondition" className="text-base">
                    その他の状態を入力してください
                  </Label>
                  <Textarea
                    id="otherCondition"
                    placeholder="例：季節性うつ、社交不安など"
                    value={otherCondition}
                    onChange={(e) => setOtherCondition(e.target.value)}
                    rows={3}
                    className="rounded-xl border-2 focus:border-primary"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full py-6 text-lg shadow-lg"
                disabled={loading || selectedConditions.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存する
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MentalConditions;
