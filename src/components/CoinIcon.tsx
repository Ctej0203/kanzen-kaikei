import { Coins } from "lucide-react";

interface CoinIconProps {
  size?: number;
  className?: string;
}

export const CoinIcon = ({ size = 20, className = "" }: CoinIconProps) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <Coins
        size={size}
        className="text-yellow-500 animate-pulse"
        style={{
          filter: "drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))",
        }}
      />
    </div>
  );
};
