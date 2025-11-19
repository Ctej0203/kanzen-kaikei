import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Video, MessageSquare, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Home } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Consultation {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  consultation_type: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const ConsultationList = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "エラー",
        description: "予約情報の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "キャンセル完了",
        description: "予約をキャンセルしました",
      });

      fetchConsultations();
    } catch (error) {
      console.error("Cancel error:", error);
      toast({
        title: "エラー",
        description: "キャンセルに失敗しました",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />予約確認中</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />確定</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-50"><XCircle className="w-3 h-3 mr-1" />キャンセル済</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <Home className="h-5 w-5 mr-2" />
              ホーム
            </Button>
            <h1 className="text-xl font-bold">予約一覧</h1>
          </div>
          <Button onClick={() => navigate("/consultation-booking")}>
            新しく予約する
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {consultations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="mb-2">予約がありません</CardTitle>
              <CardDescription className="mb-4">
                新しく予約を作成してください
              </CardDescription>
              <Button onClick={() => navigate("/consultation-booking")}>
                予約を作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          consultations.map((consultation) => {
            const date = new Date(consultation.scheduled_date);
            const isPast = date < new Date();
            const canCancel = consultation.status === "pending" || consultation.status === "confirmed";

            return (
              <Card key={consultation.id} className={isPast ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {consultation.consultation_type === "video" ? (
                          <Video className="w-5 h-5 text-primary" />
                        ) : (
                          <MessageSquare className="w-5 h-5 text-primary" />
                        )}
                        <CardTitle className="text-lg">
                          {consultation.consultation_type === "video" ? "ビデオ通話" : "チャット"}
                        </CardTitle>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(date, "yyyy年M月d日（E）", { locale: ja })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{consultation.scheduled_time}</span>
                  </div>
                  {consultation.notes && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <div className="text-sm font-semibold mb-1">相談内容</div>
                      <div className="text-sm text-muted-foreground">{consultation.notes}</div>
                    </div>
                  )}
                  {!isPast && canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-2" size="sm">
                          予約をキャンセル
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>予約をキャンセルしますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消せません。予約をキャンセルしてもよろしいですか？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>戻る</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancel(consultation.id)}>
                            キャンセルする
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConsultationList;
