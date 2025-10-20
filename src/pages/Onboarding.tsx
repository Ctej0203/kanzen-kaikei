import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState("");
  const [diagnosed, setDiagnosed] = useState<boolean | null>(null);
  const [diagnosisYear, setDiagnosisYear] = useState("");
  const [currentlyTreating, setCurrentlyTreating] = useState<boolean | null>(null);
  const [triggers, setTriggers] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      const { error } = await supabase
        .from("profiles")
        .update({
          age: age ? parseInt(age) : null,
          diagnosed: diagnosed ?? false,
          diagnosis_year: diagnosisYear ? parseInt(diagnosisYear) : null,
          currently_treating: currentlyTreating ?? false,
          triggers: triggers || null,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "設定を保存しました",
        description: "Curelyへようこそ！",
      });
      navigate("/");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>初期設定</CardTitle>
          <CardDescription>
            あなたについて教えてください（任意項目も含みます）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="age">年齢</Label>
              <Input
                id="age"
                type="number"
                placeholder="例：25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
                min="0"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label>パニック障害の診断を受けていますか？</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={diagnosed === true ? "default" : "outline"}
                  onClick={() => setDiagnosed(true)}
                  disabled={loading}
                >
                  はい
                </Button>
                <Button
                  type="button"
                  variant={diagnosed === false ? "default" : "outline"}
                  onClick={() => setDiagnosed(false)}
                  disabled={loading}
                >
                  いいえ
                </Button>
              </div>
            </div>

            {diagnosed && (
              <div className="space-y-2">
                <Label htmlFor="diagnosisYear">診断を受けた年（おおよそ）</Label>
                <Input
                  id="diagnosisYear"
                  type="number"
                  placeholder="例：2020"
                  value={diagnosisYear}
                  onChange={(e) => setDiagnosisYear(e.target.value)}
                  disabled={loading}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>現在、通院していますか？</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={currentlyTreating === true ? "default" : "outline"}
                  onClick={() => setCurrentlyTreating(true)}
                  disabled={loading}
                >
                  はい
                </Button>
                <Button
                  type="button"
                  variant={currentlyTreating === false ? "default" : "outline"}
                  onClick={() => setCurrentlyTreating(false)}
                  disabled={loading}
                >
                  いいえ
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggers">発作のきっかけ・トリガー（任意）</Label>
              <Textarea
                id="triggers"
                placeholder="例：人混み、電車、締め切った部屋など"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              始める
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;