import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import curaHappy from "@/assets/cura-happy.png";

interface LoginBonusPopupProps {
  coinsEarned: number;
  streak: number;
  onClose: () => void;
}

export const LoginBonusPopup = ({
  coinsEarned,
  streak,
  onClose,
}: LoginBonusPopupProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md border-2 border-primary/30 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative animate-bounce">
            <img
              src={curaHappy}
              alt="Happy Cura"
              className="w-32 h-32 object-contain animate-wiggle"
            />
            <div className="absolute -top-2 -right-2 text-4xl animate-spin-slow">
              ✨
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              ログインボーナス！
            </h2>
            <p className="text-lg font-bold text-foreground">
              💰 {coinsEarned}コインを受け取りました！
            </p>
            <p className="text-sm text-muted-foreground">
              {streak}日連続ログイン中 🎉
            </p>
          </div>

          <div className="flex gap-2 text-xs text-muted-foreground">
            {[10, 15, 30, 15, 20, 20, 40].map((coins, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${
                  index + 1 === streak
                    ? "bg-primary/20 border border-primary/50"
                    : index + 1 < streak
                    ? "bg-secondary/50"
                    : "bg-muted/30"
                }`}
              >
                <div className="text-xs font-bold">
                  {index + 1 === streak ? "今日" : `${index + 1}日`}
                </div>
                <div className="text-xs">{coins}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
