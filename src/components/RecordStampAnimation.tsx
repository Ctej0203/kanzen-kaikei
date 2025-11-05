import { useEffect, useState } from "react";
import curaStamp from "@/assets/cura-stamp.png";

interface RecordStampAnimationProps {
  onComplete?: () => void;
}

export const RecordStampAnimation = ({ onComplete }: RecordStampAnimationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <img
        src={curaStamp}
        alt="Record completed!"
        className="w-30 h-30 animate-stamp-pop"
      />
    </div>
  );
};
