import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EmergencyContacts } from "@/components/EmergencyContacts";

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
    <div className="min-h-screen bg-background">
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
        <EmergencyContacts />
        
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

        <Card>
          <CardHeader>
            <CardTitle>キャラクター変更</CardTitle>
            <CardDescription>
              応援してくれるキャラクターを変更します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/character-select")}>
              キャラクターを変更する
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;