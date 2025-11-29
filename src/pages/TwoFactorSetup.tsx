import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Key, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totp = data?.totp?.find(factor => factor.factor_type === 'totp');
      setIs2FAEnabled(!!totp && totp.status === 'verified');
    } catch (error: any) {
      console.error("Error checking MFA status:", error);
    }
  };

  const generateBackupCodes = async (userId: string) => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
      
      await supabase.from("backup_codes").insert({
        user_id: userId,
        code: code,
      });
    }
    return codes;
  };

  const enable2FA = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("ユーザーが見つかりません");

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Curely 2FA',
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      
      toast({
        title: "2FA設定を開始",
        description: "QRコードをスキャンして、6桁のコードを入力してください",
      });
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

  const verify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "エラー",
        description: "6桁のコードを入力してください",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const allFactors = factors?.all || [];
      const totp = allFactors.find(f => f.factor_type === 'totp' && f.status === 'unverified');
      
      if (!totp) throw new Error("2FAの設定が見つかりません");

      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totp.id,
        code: verificationCode,
      });

      if (error) throw error;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("ユーザーが見つかりません");

      const codes = await generateBackupCodes(user.user.id);
      setBackupCodes(codes);
      setShowBackupCodes(true);
      setIs2FAEnabled(true);

      toast({
        title: "2FA有効化完了",
        description: "バックアップコードを必ず保存してください",
      });
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

  const disable2FA = async () => {
    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find(f => f.status === 'verified');
      
      if (!totp) throw new Error("有効な2FAが見つかりません");

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totp.id,
      });

      if (error) throw error;

      // Delete backup codes
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from("backup_codes")
          .delete()
          .eq("user_id", user.user.id);
      }

      setIs2FAEnabled(false);
      setQrCode("");
      setSecret("");
      setVerificationCode("");
      setShowBackupCodes(false);

      toast({
        title: "2FA無効化完了",
        description: "二段階認証が無効になりました",
      });
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

  const copyCode = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    toast({
      title: "コピーしました",
      description: "全てのバックアップコードをクリップボードにコピーしました",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <div className="max-w-2xl mx-auto pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/settings")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          設定に戻る
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>二段階認証（2FA）</CardTitle>
            </div>
            <CardDescription>
              アカウントのセキュリティを強化するために二段階認証を設定します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!is2FAEnabled && !qrCode && (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    二段階認証を有効にすると、ログイン時にパスワードに加えて6桁の認証コードの入力が必要になります。
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={enable2FA}
                  disabled={loading}
                  className="w-full"
                >
                  2FAを有効化
                </Button>
              </div>
            )}

            {qrCode && !is2FAEnabled && (
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    認証アプリ（Google Authenticator、Authy等）でQRコードをスキャンしてください
                  </p>
                  <div className="flex justify-center">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                  <div className="space-y-2">
                    <Label>または、このキーを手動で入力</Label>
                    <div className="flex gap-2">
                      <Input value={secret} readOnly />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">認証アプリに表示される6桁のコードを入力</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  onClick={verify2FA}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  確認して有効化
                </Button>
              </div>
            )}

            {showBackupCodes && backupCodes.length > 0 && (
              <div className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>重要：</strong> これらのバックアップコードを安全な場所に保存してください。
                    認証アプリにアクセスできなくなった場合に使用できます。
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>バックアップコード</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllCodes}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      全てコピー
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <code className="font-mono text-sm">{code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyCode(code, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/settings")}
                  className="w-full"
                >
                  完了
                </Button>
              </div>
            )}

            {is2FAEnabled && !showBackupCodes && (
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    二段階認証が有効になっています。アカウントは保護されています。
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={disable2FA}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  2FAを無効化
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactorSetup;