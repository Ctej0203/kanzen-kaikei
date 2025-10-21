import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import curaCharacter from "@/assets/cura-character.png";

const Settings = () => {
  const navigate = useNavigate();

  const exportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const { data: records, error } = await supabase
        .from("symptom_records")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      if (error) throw error;

      const dataStr = JSON.stringify(records, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `curely-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "データをエクスポートしました",
      });
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating character */}
      <img 
        src={curaCharacter} 
        alt="Cura" 
        className="fixed bottom-4 right-4 w-24 h-24 md:w-32 md:h-32 animate-bounce-soft z-50 pointer-events-none"
      />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">設定</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>データのエクスポート</CardTitle>
            <CardDescription>
              症状記録をJSON形式でダウンロードします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              データをダウンロード
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>利用規約・免責事項</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              本アプリは、パニック障害のセルフマネジメントを支援するツールです。
            </p>
            <p>
              医療行為や診断を目的としたものではありません。症状が続く場合は、
              必ず医療機関を受診してください。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>緊急時の連絡先</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>緊急時は以下の窓口にご相談ください：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>こころの健康相談統一ダイヤル: 0570-064-556</li>
              <li>よりそいホットライン: 0120-279-338</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プロフィール編集</CardTitle>
            <CardDescription>
              オンボーディング情報を再設定します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/onboarding")}>
              プロフィールを編集
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;