import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Video, MessageSquare, Calendar as CalendarIcon, Clock } from "lucide-react";

const ConsultationBooking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<string>("video");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 予約可能な時間スロット（9:00-18:00、30分刻み）
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "エラー",
        description: "日付と時間を選択してください",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "エラー",
          description: "ログインしてください",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("consultations").insert({
        user_id: user.id,
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: selectedTime,
        consultation_type: consultationType,
        notes: notes || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "予約完了",
        description: "オンライン診療の予約が完了しました",
      });

      navigate("/consultation-list");
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "エラー",
        description: "予約に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 過去の日付を選択不可にする
  const disabledDays = { before: new Date() };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/online-consultation")}
            className="mr-2"
          >
            ← 戻る
          </Button>
          <h1 className="text-xl font-bold">予約日時を選択</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* 相談方法選択 */}
        <Card>
          <CardHeader>
            <CardTitle>相談方法を選択</CardTitle>
            <CardDescription>ビデオ通話またはチャットをお選びください</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={consultationType} onValueChange={setConsultationType}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Video className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">ビデオ通話</div>
                    <div className="text-sm text-muted-foreground">顔を見て相談できます</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="chat" id="chat" />
                <Label htmlFor="chat" className="flex items-center gap-2 cursor-pointer flex-1">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">チャット</div>
                    <div className="text-sm text-muted-foreground">テキストでやり取りできます</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 日付選択 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              日付を選択
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              locale={ja}
              className="rounded-md border pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* 時間選択 */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                時間を選択
              </CardTitle>
              <CardDescription>
                選択日: {format(selectedDate, "yyyy年M月d日（E）", { locale: ja })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="時間を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* メモ欄 */}
        {selectedDate && selectedTime && (
          <Card>
            <CardHeader>
              <CardTitle>相談内容・気になること（任意）</CardTitle>
              <CardDescription>事前に伝えたいことがあればご記入ください</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="例：最近眠れないことが続いています..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        )}

        {/* 予約ボタン */}
        {selectedDate && selectedTime && (
          <Button
            onClick={handleBooking}
            disabled={loading}
            className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {loading ? "予約中..." : "この日時で予約する"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConsultationBooking;
