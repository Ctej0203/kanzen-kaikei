import { Heart } from "lucide-react";
import { useCharacter } from "@/hooks/useCharacter";
import { useCharacterAffection } from "@/hooks/useCharacterAffection";
import { Progress } from "@/components/ui/progress";

export const AffectionDisplay = () => {
  const { selectedCharacter } = useCharacter();
  const { getAffectionLevel, getProgressToNextThreshold } = useCharacterAffection();

  const affection = getAffectionLevel(selectedCharacter.id);
  const progress = getProgressToNextThreshold(affection);
  const nextThreshold = Math.ceil(affection / 10) * 10;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="text-sm font-bold text-foreground">
            {selectedCharacter.name}の好感度
          </span>
        </div>
        <span className="text-2xl font-bold text-primary">
          Lv.{affection}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>次のレベルまで</span>
          <span>{progress}/10</span>
        </div>
        <Progress 
          value={(progress / 10) * 100} 
          className="h-2"
        />
        {nextThreshold > affection && (
          <div className="text-xs text-center text-muted-foreground">
            Lv.{nextThreshold}で<span className="text-primary font-bold">50コイン</span>獲得！
          </div>
        )}
      </div>
    </div>
  );
};
