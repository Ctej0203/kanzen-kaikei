import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecordStreak } from "@/hooks/useRecordStreak";
import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";

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
    <Card className="w-full shadow-lg hover:shadow-xl transition-all hover-lift gradient-card border-2 border-accent/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="text-foreground">
            📝 {streak?.current_streak || 0}日連続記録中！
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((dateStr) => {
            const date = new Date(dateStr);
            const dayOfWeek = format(date, "E", { locale: ja });
            const dayNum = format(date, "d");
            const hasRecord = recordedDates.has(dateStr);

            return (
              <div
                key={dateStr}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/50 relative"
              >
                <div className="text-xs font-medium" style={{ color: '#FFD6E7' }}>
                  {dayOfWeek}
                </div>
                <div className="text-sm font-bold" style={{ color: '#FFD6E7' }}>
                  {dayNum}
                </div>
                {hasRecord && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center animate-scale-in"
                    style={{ animation: 'scale-in 0.3s ease-out' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-4 flex items-center justify-center"
                      style={{ 
                        borderColor: '#FF66AA',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <span className="text-xl">😊</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {streak && streak.current_streak > 0 && (
          <div className="mt-4 text-center text-sm" style={{ color: '#FF6699' }}>
            ✨ すばらしい！このまま続けましょう！
          </div>
        )}
      </CardContent>
    </Card>
  );
};
