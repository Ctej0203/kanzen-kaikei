import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Gift } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Referral {
  id: string;
  created_at: string;
  reward_given: boolean;
}

export const ReferralSection = () => {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile-referral"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
  });

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    }
  }, [profile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "コピーしました！",
      description: "紹介コードをクリップボードにコピーしました",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "リンクをコピーしました！",
      description: "紹介リンクをクリップボードにコピーしました",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          友達紹介プログラム
        </CardTitle>
        <CardDescription>
          友達を招待して報酬をゲット！
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            あなたの紹介コード
          </p>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono text-lg font-bold"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            紹介リンク
          </p>
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              className="text-sm"
            />
            <Button
              onClick={copyShareLink}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 p-4 space-y-2">
          <h4 className="font-semibold text-sm">報酬について</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 友達が登録すると、あなたに <strong className="text-primary">100コイン</strong></li>
            <li>• 友達も <strong className="text-primary">50コイン</strong> のボーナスを獲得</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">紹介履歴</h4>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだ紹介履歴がありません
            </p>
          ) : (
            <div className="space-y-2">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="text-sm font-medium">友達が登録しました</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  {referral.reward_given && (
                    <div className="text-sm font-bold text-primary">
                      +100 💰
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {referrals.length > 0 && (
            <p className="text-sm font-semibold text-primary">
              合計: {referrals.length}人招待 • {referrals.filter(r => r.reward_given).length * 100}コイン獲得
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
