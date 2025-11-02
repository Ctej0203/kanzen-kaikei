import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCoins } from "@/hooks/useCoins";
import { CoinIcon } from "./CoinIcon";
import { Button } from "./ui/button";

export const CoinBalance = () => {
  const navigate = useNavigate();
  const { totalCoins, isLoading } = useCoins();
  const [showAnimation, setShowAnimation] = useState(false);
  const [coinDiff, setCoinDiff] = useState(0);
  const prevCoinsRef = useRef<number | null>(null);

  useEffect(() => {
    if (totalCoins !== undefined && prevCoinsRef.current !== null) {
      const diff = totalCoins - prevCoinsRef.current;
      if (diff !== 0) {
        setCoinDiff(diff);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2000);
      }
    }
    prevCoinsRef.current = totalCoins ?? 0;
  }, [totalCoins]);

  const handleClick = () => {
    navigate("/gacha");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
        <CoinIcon size={18} />
        <span className="text-sm font-bold text-foreground">---</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary transition-all hover-lift border border-border/50"
      >
        <CoinIcon size={18} />
        <span className="text-sm font-bold text-foreground tabular-nums">
          {totalCoins?.toLocaleString() ?? 0}
        </span>
      </Button>

      {showAnimation && coinDiff > 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none animate-coin-float">
          <span className="text-sm font-bold text-primary whitespace-nowrap">
            +{coinDiff} 💰
          </span>
        </div>
      )}
    </div>
  );
};
