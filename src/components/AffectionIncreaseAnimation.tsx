import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface AffectionIncreaseAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export const AffectionIncreaseAnimation = ({ 
  amount, 
  onComplete 
}: AffectionIncreaseAnimationProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="animate-scale-in">
        <div className="relative">
          <Heart 
            className="w-16 h-16 text-primary fill-primary animate-pulse" 
            strokeWidth={3}
          />
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg animate-bounce">
            +{amount}
          </div>
        </div>
        <div className="text-center mt-2 text-sm font-bold text-primary animate-fade-in">
          好感度アップ！
        </div>
      </div>
    </div>
  );
};
