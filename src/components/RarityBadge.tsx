import { Badge } from "@/components/ui/badge";

interface RarityBadgeProps {
  rarity: "R" | "SR" | "SSR";
}

export const RarityBadge = ({ rarity }: RarityBadgeProps) => {
  const rarityConfig = {
    R: { label: "R", className: "bg-gray-400 text-white" },
    SR: { label: "SR", className: "bg-blue-500 text-white" },
    SSR: { label: "SSR", className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold" },
  };

  const config = rarityConfig[rarity];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};
