import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRecordStreak } from "@/hooks/useRecordStreak";
import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import curaStamp from "@/assets/cura-stamp.png";

interface RecordCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordCalendar = ({ open, onOpenChange }: RecordCalendarProps) => {
  const { streak } = useRecordStreak();

  // 過去7日分の日付を生成
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "yyyy-MM-dd");
  });

  // 記録した日付のセットを作成
  const recordedDates = new Set(
    streak?.record_history
      ? (Array.isArray(streak.record_history) 
          ? streak.record_history 
          : JSON.parse(JSON.stringify(streak.record_history)))
        .map((item: any) => item.date)
      : []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card/95 via-secondary/30 to-card/95 backdrop-blur-sm border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="text-3xl">📝</span>
            記録カレンダー
          </DialogTitle>
        </DialogHeader>
        {streak && (
          <div className="text-left px-4 pt-2">
            <p className="text-lg font-bold text-primary">
              {streak.current_streak}日連続！
            </p>
          </div>
        )}
        <div className="grid grid-cols-7 gap-3 p-4">
          {last7Days.map((dateStr) => {
            const date = new Date(dateStr);
            const dayOfWeek = format(date, "E", { locale: ja });
            const dayNum = format(date, "d");
            const hasRecord = recordedDates.has(dateStr);

            return (
              <div
                key={dateStr}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/30"
              >
                <div className="text-sm text-muted-foreground font-medium">
                  {dayOfWeek}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {dayNum}
                </div>
                <div className="w-16 h-16 flex items-center justify-center">
                  {hasRecord ? (
                    <img
                      src={curaStamp}
                      alt="Cura stamp"
                      className="w-20 h-20 animate-bounce-in"
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-muted/50"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {streak && (
          <div className="mt-2 text-center pb-4">
            <p className="text-base text-muted-foreground">
              このまま続けよう！✨
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
