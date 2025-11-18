import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BreathingGuide } from "@/components/BreathingGuide";

const BreathingGuidePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            ← 戻る
          </Button>
          <h1 className="text-xl font-bold">🌸 呼吸法ガイド</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6 text-center space-y-2">
          <p className="text-muted-foreground">
            リラックスするための呼吸法を実践しましょう
          </p>
          <p className="text-sm text-muted-foreground">
            3セット完了することで、心を落ち着かせる効果があります
          </p>
        </div>
        
        <BreathingGuide />
      </div>
    </div>
  );
};

export default BreathingGuidePage;
