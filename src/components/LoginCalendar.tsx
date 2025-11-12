import { useLoginBonus } from "@/hooks/useLoginBonus";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, subDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import curaStamp from "@/assets/cura-stamp.png";

interface LoginCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginCalendar = ({ open, onOpenChange }: LoginCalendarProps) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card/95 via-secondary/30 to-card/95 backdrop-blur-sm border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="text-3xl">📅</span>
            ログインカレンダー
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-7 gap-3 p-4">
          {last7Days.map((dateStr) => {
            const date = parseISO(dateStr);
            const hasLogin = loginDates.has(dateStr);

            return (
              <div
                key={dateStr}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/30"
              >
                <div className="text-sm text-muted-foreground font-medium">
                  {format(date, "EEE", { locale: ja })}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {format(date, "d")}
                </div>
                <div className="w-16 h-16 flex items-center justify-center">
                  {hasLogin ? (
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
            <p className="text-lg font-bold text-primary">
              🎉 {streak.current_streak}日連続ログイン！
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
