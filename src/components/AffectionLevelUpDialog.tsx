import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Sparkles } from "lucide-react";
import { CharacterData } from "@/lib/characterData";

interface AffectionLevelUpDialogProps {
  character: CharacterData;
  level: number;
  message: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AffectionLevelUpDialog = ({
  character,
  level,
  message,
  open,
  onOpenChange,
}: AffectionLevelUpDialogProps) => {
  const [showSparkles, setShowSparkles] = useState(true);

  useEffect(() => {
    if (open) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-primary fill-primary animate-pulse" />
            好感度レベルアップ！
            <Heart className="w-6 h-6 text-primary fill-primary animate-pulse" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* キャラクター画像 */}
          <div className="relative flex justify-center">
            <div className="relative">
              <img
                src={character.image}
                alt={character.name}
                className="w-32 h-32 object-contain animate-scale-in"
              />
              {showSparkles && (
                <>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-primary animate-pulse" />
                </>
              )}
            </div>
          </div>

          {/* レベル表示 */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary animate-scale-in">
              Lv.{level}
            </div>
            <div className="text-sm text-muted-foreground">
              {character.name}との絆が深まりました
            </div>
          </div>

          {/* 特別メッセージ */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{character.emoji}</div>
              <div className="space-y-2 flex-1">
                <div className="font-bold text-foreground">
                  {character.name}
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  {message}
                </div>
              </div>
            </div>
          </div>

          {/* 報酬表示 */}
          <div className="bg-primary/10 rounded-lg p-3 text-center animate-fade-in">
            <div className="text-sm font-bold text-primary">
              🎁 ボーナス報酬：50コイン獲得！
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
