import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecordStreak } from "@/hooks/useRecordStreak";
import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import curaStamp from "@/assets/cura-stamp.png";

export const RecordCalendar = () => {
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
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 hover-lift">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-2xl">📝</span>
        記録カレンダー
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {last7Days.map((dateStr) => {
          const date = new Date(dateStr);
          const dayOfWeek = format(date, "E", { locale: ja });
          const dayNum = format(date, "d");
          const hasRecord = recordedDates.has(dateStr);

          return (
            <div
              key={dateStr}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30"
            >
              <div className="text-xs text-muted-foreground font-medium">
                {dayOfWeek}
              </div>
              <div className="text-xs font-bold text-foreground">
                {dayNum}
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                {hasRecord ? (
                  <img
                    src={curaStamp}
                    alt="Cura stamp"
                    className="w-16 h-16 animate-bounce-in"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted/50"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {streak && (
        <div className="mt-3 text-center">
          <p className="text-sm text-muted-foreground">
            現在 <span className="font-bold text-primary">{streak.current_streak}</span> 日連続！
          </p>
        </div>
      )}
    </Card>
  );
};
