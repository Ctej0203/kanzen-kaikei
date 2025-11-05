import { useLoginBonus } from "@/hooks/useLoginBonus";
import { Card } from "@/components/ui/card";
import { format, subDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import curaStamp from "@/assets/cura-stamp.png";

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
              <div className="w-10 h-10 flex items-center justify-center">
                {hasLogin ? (
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
