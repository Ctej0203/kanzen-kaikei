import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useCharacter } from "@/hooks/useCharacter";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASE_DURATIONS = {
  inhale: 4,
  hold: 4,
  exhale: 6,
  rest: 2,
};

const PHASE_LABELS = {
  inhale: "吸う",
  hold: "止める",
  exhale: "吐く",
  rest: "休憩",
};

const TOTAL_SETS = 3;

export const BreathingGuide = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const { selectedCharacter } = useCharacter();

  const currentDuration = PHASE_DURATIONS[phase];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newSeconds = prev + 0.1;
        
        if (newSeconds >= currentDuration) {
          // Move to next phase
          if (phase === "inhale") {
            setPhase("hold");
          } else if (phase === "hold") {
            setPhase("exhale");
          } else if (phase === "exhale") {
            setPhase("rest");
          } else if (phase === "rest") {
            if (currentSet < TOTAL_SETS) {
              setCurrentSet(currentSet + 1);
              setPhase("inhale");
            } else {
              setIsActive(false);
              return 0;
            }
          }
          return 0;
        }
        
        setProgress((newSeconds / currentDuration) * 100);
        return newSeconds;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, phase, currentDuration, currentSet]);

  const handleReset = () => {
    setIsActive(false);
    setCurrentSet(1);
    setPhase("inhale");
    setSeconds(0);
    setProgress(0);
  };

  const isComplete = !isActive && currentSet === TOTAL_SETS && phase === "rest";

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow gradient-card border-2 border-primary/10">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={selectedCharacter.image} 
              alt={selectedCharacter.name}
              className="w-20 h-20 animate-bounce-soft"
            />
          </div>
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground font-medium">
              セット {currentSet} / {TOTAL_SETS}
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {PHASE_LABELS[phase]}
            </div>
            <div className="text-7xl font-bold text-primary animate-bounce-soft">
              {Math.ceil(currentDuration - seconds)}
            </div>
          </div>

          <Progress value={progress} className="h-2" />

          {isComplete && (
            <div className="text-center text-success font-bold text-xl animate-bounce-soft">
              ✨ お疲れ様でした！ ✨
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setIsActive(!isActive)}
              disabled={isComplete}
              className="min-w-[140px] shadow-lg hover:shadow-xl transition-all hover-lift font-bold"
            >
              {isActive ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  一時停止
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  {currentSet === 1 && seconds === 0 ? "✨ 開始" : "再開"}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
              className="shadow-md hover:shadow-lg transition-all hover-lift border-2 font-bold"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              リセット
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};