import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoginBonus } from "@/hooks/useLoginBonus";
import { useRecordStreak } from "@/hooks/useRecordStreak";
import { format, subDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import curaStamp from "@/assets/cura-stamp.png";

interface UnifiedCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "record";
}

export const UnifiedCalendar = ({ open, onOpenChange, defaultTab = "login" }: UnifiedCalendarProps) => {
  const { streak: loginStreak } = useLoginBonus();
  const { streak: recordStreak } = useRecordStreak();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "yyyy-MM-dd");
  });

  const loginDates = new Set<string>(
    (loginStreak?.login_history || []).map((entry) => {
      try {
        return format(parseISO(entry.date), "yyyy-MM-dd");
      } catch {
        return entry.date;
      }
    })
  );

  const recordedDates = new Set<string>(
    recordStreak?.record_history
      ? (Array.isArray(recordStreak.record_history) 
          ? recordStreak.record_history 
          : JSON.parse(JSON.stringify(recordStreak.record_history)))
        .map((item: any) => item.date)
      : []
  );

  const renderCalendar = (dates: Set<string>, streak: number | undefined, title: string) => (
    <>
      {streak !== undefined && (
        <div className="text-left px-4 pt-2">
          <p className="text-lg font-bold text-primary">
            {streak}日連続！
          </p>
        </div>
      )}
      <div className="grid grid-cols-7 gap-2 p-4">
        {last7Days.map((dateStr) => {
          const date = parseISO(dateStr);
          const hasRecord = dates.has(dateStr);

          return (
            <div
              key={dateStr}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30"
            >
              <div className="text-xs text-muted-foreground font-medium">
                {format(date, "EEE", { locale: ja })}
              </div>
              <div className="text-sm font-bold text-foreground">
                {format(date, "d")}
              </div>
              <div className="w-12 h-12 flex items-center justify-center">
                {hasRecord ? (
                  <img
                    src={curaStamp}
                    alt="Cura stamp"
                    className="w-14 h-14 animate-bounce-in object-contain"
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted/50"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card/95 via-secondary/30 to-card/95 backdrop-blur-sm border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="text-3xl">📅</span>
            カレンダー
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="record">記録</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            {renderCalendar(loginDates, loginStreak?.current_streak, "ログインカレンダー")}
            {loginStreak && (
              <div className="mt-2 text-center pb-4">
                <p className="text-base text-muted-foreground">
                  このまま続けよう！✨
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="record">
            {renderCalendar(recordedDates, recordStreak?.current_streak, "記録カレンダー")}
            {recordStreak && (
              <div className="mt-2 text-center pb-4">
                <p className="text-base text-muted-foreground">
                  このまま続けよう！✨
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
