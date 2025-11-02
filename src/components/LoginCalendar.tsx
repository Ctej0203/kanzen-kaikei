import { useLoginBonus } from "@/hooks/useLoginBonus";
import { Card } from "@/components/ui/card";
import { format, subDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

export const LoginCalendar = () => {
  const { streak } = useLoginBonus();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "yyyy-MM-dd");
  });

  const loginHistory = streak?.login_history || [];
  const loginDates = new Set(
    loginHistory.map((entry) => {
      try {
        return format(parseISO(entry.date), "yyyy-MM-dd");
      } catch {
        return entry.date;
      }
    })
  );

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 hover-lift">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-2xl">📅</span>
        ログインカレンダー
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {last7Days.map((dateStr) => {
          const date = parseISO(dateStr);
          const hasLogin = loginDates.has(dateStr);

          return (
            <div
              key={dateStr}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30"
            >
              <div className="text-xs text-muted-foreground font-medium">
                {format(date, "EEE", { locale: ja })}
              </div>
              <div className="text-xs font-bold text-foreground">
                {format(date, "d")}
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                {hasLogin ? (
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full animate-scale-in"
                  >
                    {/* Curaちゃんの顔スタンプ（濃いピンクの縁取り） */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="4"
                    />
                    {/* 目 */}
                    <circle cx="38" cy="45" r="4" fill="#ec4899" />
                    <circle cx="62" cy="45" r="4" fill="#ec4899" />
                    {/* 笑顔の口 */}
                    <path
                      d="M 35 55 Q 50 65 65 55"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* 頬の赤み */}
                    <circle cx="28" cy="55" r="5" fill="#fda4af" opacity="0.5" />
                    <circle cx="72" cy="55" r="5" fill="#fda4af" opacity="0.5" />
                  </svg>
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
