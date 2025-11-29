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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive"
      });
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
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">または</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Googleでログイン
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