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
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="w-10 h-10 animate-bounce-in"
                    >
                      {/* Curaちゃんの顔スタンプ（濃いピンクの縁取りのみ） */}
                      {/* 耳（左） */}
                      <ellipse
                        cx="30"
                        cy="25"
                        rx="12"
                        ry="18"
                        fill="none"
                        stroke="#FF66AA"
                        strokeWidth="3"
                      />
                      {/* 耳（右） */}
                      <ellipse
                        cx="70"
                        cy="25"
                        rx="12"
                        ry="18"
                        fill="none"
                        stroke="#FF66AA"
                        strokeWidth="3"
                      />
                      {/* 顔の輪郭 */}
                      <circle
                        cx="50"
                        cy="55"
                        r="28"
                        fill="none"
                        stroke="#FF66AA"
                        strokeWidth="3"
                      />
                      {/* 目（左） */}
                      <circle cx="40" cy="50" r="3" fill="#FF66AA" />
                      {/* 目（右） */}
                      <circle cx="60" cy="50" r="3" fill="#FF66AA" />
                      {/* 笑顔の口 */}
                      <path
                        d="M 38 60 Q 50 68 62 60"
                        fill="none"
                        stroke="#FF66AA"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* 頬の赤み（左） */}
                      <circle cx="32" cy="58" r="4" fill="none" stroke="#FF66AA" strokeWidth="1.5" />
                      {/* 頬の赤み（右） */}
                      <circle cx="68" cy="58" r="4" fill="none" stroke="#FF66AA" strokeWidth="1.5" />
                    </svg>
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
