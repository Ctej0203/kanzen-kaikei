import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PremiumBadge = () => {
  return (
    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <Crown size={14} className="mr-1" />
      Premium
    </Badge>
  );
};
