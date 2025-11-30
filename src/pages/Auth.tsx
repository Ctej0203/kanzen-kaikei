import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import curaCharacter from "@/assets/cura-character.png";
import loginCharacters from "@/assets/login-characters.png";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [backupCodeMode, setBackupCodeMode] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    // Listen for auth state changes (e.g., after OAuth callback)
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "エラー",
        description: "パスワードが一致しません",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          // Check if 2FA is required
          if (error.message.includes("MFA")) {
            // Get the factor that needs verification
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const totp = factors?.totp?.find(f => f.status === 'verified');
            
            if (totp) {
              setPendingFactorId(totp.id);
              setShow2FADialog(true);
              setLoading(false);
              return;
            }
          }
          throw error;
        }
        
        toast({
          title: "ログインしました",
          description: "ようこそ！"
        });
        navigate("/");
      } else {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;

        // Process referral code if provided
        if (referralCode.trim() && data.user) {
          const {
            error: referralError
          } = await supabase.rpc("process_referral", {
            p_referred_user_id: data.user.id,
            p_referral_code: referralCode.trim().toUpperCase()
          });
          if (referralError) {
            console.error("Referral processing error:", referralError);
          }
        }
        toast({
          title: "確認メールを送信しました",
          description: "メールアドレスを確認してアカウントを有効化してください"
        });
      }
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verify2FACode = async () => {
    if (!pendingFactorId) return;
    
    setLoading(true);
    try {
      if (backupCodeMode) {
        // Verify backup code
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("ユーザーが見つかりません");

        const { data: backupCode, error: backupError } = await supabase
          .from("backup_codes")
          .select("*")
          .eq("user_id", user.user.id)
          .eq("code", twoFactorCode.toUpperCase())
          .eq("used", false)
          .single();

        if (backupError || !backupCode) {
          throw new Error("無効なバックアップコードです");
        }

        // Mark backup code as used
        await supabase
          .from("backup_codes")
          .update({ used: true, used_at: new Date().toISOString() })
          .eq("id", backupCode.id);

        toast({
          title: "ログインしました",
          description: "バックアップコードを使用してログインしました"
        });
      } else {
        // Verify TOTP code
        const { data, error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: pendingFactorId,
          code: twoFactorCode
        });

        if (error) throw error;
      }

      setShow2FADialog(false);
      setTwoFactorCode("");
      setPendingFactorId(null);
      setBackupCodeMode(false);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <Card className="w-full max-w-md shadow-xl hover:shadow-2xl transition-shadow border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            ✨ Curely
          </CardTitle>
          <CardDescription className="text-base font-medium">
            Kawaii × Mental Care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} minLength={6} />
            </div>
            {!isLogin && <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralCode">紹介コード（任意）</Label>
                  <Input id="referralCode" type="text" placeholder="紹介コードをお持ちの方は入力" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} disabled={loading} maxLength={8} />
                </div>
              </>}
            <Button type="submit" className="w-full shadow-lg hover:shadow-xl transition-all hover-lift font-bold" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "✨ ログイン" : "✨ アカウント作成"}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
              {isLogin ? "アカウントを作成" : "ログインに戻る"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>二段階認証</DialogTitle>
            <DialogDescription>
              {backupCodeMode 
                ? "バックアップコードを入力してください" 
                : "認証アプリに表示されている6桁のコードを入力してください"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-code">
                {backupCodeMode ? "バックアップコード" : "認証コード"}
              </Label>
              <Input
                id="2fa-code"
                type="text"
                maxLength={backupCodeMode ? 8 : 6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(
                  backupCodeMode 
                    ? e.target.value.toUpperCase() 
                    : e.target.value.replace(/\D/g, '')
                )}
                placeholder={backupCodeMode ? "XXXXXXXX" : "000000"}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button
              onClick={verify2FACode}
              disabled={loading || (backupCodeMode ? twoFactorCode.length !== 8 : twoFactorCode.length !== 6)}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              確認
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setBackupCodeMode(!backupCodeMode)}
            >
              {backupCodeMode ? "認証コードを使用" : "バックアップコードを使用"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default Auth;