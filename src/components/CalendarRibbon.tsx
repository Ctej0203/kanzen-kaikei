import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarRibbonProps {
  onLoginCalendarClick: () => void;
  onRecordCalendarClick: () => void;
}

export const CalendarRibbon = ({ onLoginCalendarClick, onRecordCalendarClick }: CalendarRibbonProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all">
      <Button
        variant="ghost"
        size="icon"
        onClick={onLoginCalendarClick}
        className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all rounded-full w-12 h-12"
        title="ログインカレンダー"
      >
        <Calendar className="h-6 w-6" />
        <span className="sr-only">ログインカレンダー</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRecordCalendarClick}
        className="hover-lift hover:bg-secondary/50 hover:text-primary transition-all rounded-full w-12 h-12"
        title="記録カレンダー"
      >
        <Calendar className="h-6 w-6" fill="currentColor" />
        <span className="sr-only">記録カレンダー</span>
      </Button>
    </div>
  );
};
