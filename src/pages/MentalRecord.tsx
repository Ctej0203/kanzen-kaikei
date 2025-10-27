import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Pill, Calendar, FileText, Loader2 } from "lucide-react";

interface MentalHealthRecord {
  id?: string;
  diagnosis_name: string;
  symptom_severity: string;
  medication_morning: string;
  medication_noon: string;
  medication_evening: string;
  medication_notes: string;
  doctor_appointment: string;
  notes: string;
}

const MentalRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [record, setRecord] = useState<MentalHealthRecord>({
    diagnosis_name: "",
    symptom_severity: "軽度",
    medication_morning: "",
    medication_noon: "",
    medication_evening: "",
    medication_notes: "",
    doctor_appointment: "",
    notes: "",
  });

  useEffect(() => {
    fetchLatestRecord();
  }, []);

  const fetchLatestRecord = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("mental_health_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestRecord = data[0];
        setRecord({
          id: latestRecord.id,
          diagnosis_name: latestRecord.diagnosis_name || "",
          symptom_severity: latestRecord.symptom_severity || "軽度",
          medication_morning: latestRecord.medication_morning || "",
          medication_noon: latestRecord.medication_noon || "",
          medication_evening: latestRecord.medication_evening || "",
          medication_notes: latestRecord.medication_notes || "",
          doctor_appointment: latestRecord.doctor_appointment 
            ? new Date(latestRecord.doctor_appointment).toISOString().slice(0, 16)
            : "",
          notes: latestRecord.notes || "",
        });
      }
    } catch (error: any) {
      console.error("記録取得エラー:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const recordData = {
        user_id: user.id,
        diagnosis_name: record.diagnosis_name || null,
        symptom_severity: record.symptom_severity,
        medication_morning: record.medication_morning || null,
        medication_noon: record.medication_noon || null,
        medication_evening: record.medication_evening || null,
        medication_notes: record.medication_notes || null,
        doctor_appointment: record.doctor_appointment 
          ? new Date(record.doctor_appointment).toISOString()
          : null,
        notes: record.notes || null,
      };

      const { error } = await supabase
        .from("mental_health_records")
        .insert(recordData);

      if (error) throw error;

      toast({
        title: "保存しました",
        description: "メンタル記録を保存しました",
      });

      // Refresh to get the new record
      await fetchLatestRecord();
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

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              💖 こころの記録
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* 診断情報 */}
          <Card className="shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Heart className="h-5 w-5 text-primary" />
                診断情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">診断名</Label>
                <Input
                  id="diagnosis"
                  placeholder="例：うつ病、不安障害など"
                  value={record.diagnosis_name}
                  onChange={(e) => setRecord({ ...record, diagnosis_name: e.target.value })}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">症状の程度</Label>
                <Select
                  value={record.symptom_severity}
                  onValueChange={(value) => setRecord({ ...record, symptom_severity: value })}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="軽度">軽度</SelectItem>
                    <SelectItem value="中等度">中等度</SelectItem>
                    <SelectItem value="重度">重度</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 服薬情報 */}
          <Card className="shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Pill className="h-5 w-5 text-accent" />
                服薬情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="morning">朝の服薬</Label>
                <Input
                  id="morning"
                  placeholder="例：抗うつ薬 10mg"
                  value={record.medication_morning}
                  onChange={(e) => setRecord({ ...record, medication_morning: e.target.value })}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noon">昼の服薬</Label>
                <Input
                  id="noon"
                  placeholder="例：安定剤 5mg"
                  value={record.medication_noon}
                  onChange={(e) => setRecord({ ...record, medication_noon: e.target.value })}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evening">夜の服薬</Label>
                <Input
                  id="evening"
                  placeholder="例：睡眠薬 15mg"
                  value={record.medication_evening}
                  onChange={(e) => setRecord({ ...record, medication_evening: e.target.value })}
                  className="border-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="med-notes">服薬に関するメモ</Label>
                <Textarea
                  id="med-notes"
                  placeholder="副作用や気になることがあれば記録してください"
                  value={record.medication_notes}
                  onChange={(e) => setRecord({ ...record, medication_notes: e.target.value })}
                  rows={3}
                  className="resize-none border-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* 医師面談 */}
          <Card className="shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-5 w-5 text-success" />
                医師との面談予定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="appointment">次回予定日時</Label>
              <Input
                id="appointment"
                type="datetime-local"
                value={record.doctor_appointment}
                onChange={(e) => setRecord({ ...record, doctor_appointment: e.target.value })}
                className="border-2"
              />
            </CardContent>
          </Card>

          {/* その他メモ */}
          <Card className="shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                その他のメモ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="notes">気になることや記録したいこと</Label>
              <Textarea
                id="notes"
                placeholder="今の気持ちや、先生に相談したいことなど"
                value={record.notes}
                onChange={(e) => setRecord({ ...record, notes: e.target.value })}
                rows={4}
                className="resize-none border-2"
              />
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full shadow-lg hover:shadow-xl transition-all hover-lift font-bold text-lg h-12"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            💾 保存する
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MentalRecord;
