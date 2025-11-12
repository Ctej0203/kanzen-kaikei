import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import curaCharacter from "@/assets/cura-character.png";
import suuCharacter from "@/assets/suu-character.png";
import lunoCharacter from "@/assets/luno-character.png";

type Character = "cura" | "suu" | "luno";

interface CharacterData {
  id: Character;
  name: string;
  emoji: string;
  greeting: string;
  color: string;
  image: string;
  description: string;
}

const characters: CharacterData[] = [
  {
    id: "cura",
    name: "Cura",
    emoji: "🩷",
    greeting: "元気？Curaだよ🩷",
    color: "hsl(320, 85%, 68%)",
    image: curaCharacter,
    description: "元気で前向き、励ましてくれるタイプ",
  },
  {
    id: "suu",
    name: "Suu",
    emoji: "🩵",
    greeting: "やっほ〜！Suuだよ🩵",
    color: "hsl(180, 75%, 72%)",
    image: suuCharacter,
    description: "やさしくて、おっとりした性格",
  },
  {
    id: "luno",
    name: "Luno",
    emoji: "💜",
    greeting: "こんにちは、Lunoだよ🌙",
    color: "hsl(280, 50%, 70%)",
    image: lunoCharacter,
    description: "静かで夢見るような雰囲気",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 2: Character selection
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showCharacterConfirmation, setShowCharacterConfirmation] = useState(false);
  
  // Step 3: Profile information
  const [age, setAge] = useState("");
  const [diagnosed, setDiagnosed] = useState<boolean | null>(null);
  const [diagnosisYear, setDiagnosisYear] = useState("");
  const [currentlyTreating, setCurrentlyTreating] = useState<boolean | null>(null);
  const [triggers, setTriggers] = useState("");

  const handleCharacterSelect = (characterId: Character) => {
    setSelectedCharacter(characterId);
  };

  const handleCharacterConfirm = () => {
    if (selectedCharacter) {
      setShowCharacterConfirmation(true);
      localStorage.setItem("selectedCharacter", selectedCharacter);
      
      setTimeout(() => {
        setShowCharacterConfirmation(false);
        setStep(3);
      }, 1500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ユーザーが見つかりません");

      const { error } = await supabase
        .from("profiles")
        .update({
          selected_character: selectedCharacter,
          age: age ? parseInt(age) : null,
          diagnosed: diagnosed ?? false,
          diagnosis_year: diagnosisYear ? parseInt(diagnosisYear) : null,
          currently_treating: currentlyTreating ?? false,
          triggers: triggers || null,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "設定を保存しました",
        description: "Curelyへようこそ！",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Welcome Screen
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-accent/20 via-background to-secondary/30">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              ようこそ！
            </h1>
            <div className="text-6xl animate-bounce-in">✨</div>
          </div>
          
          <Card className="bg-card/90 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Curelyへようこそ</CardTitle>
              <CardDescription className="text-lg">
                あなたの心の健康をサポートするアプリです
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <p className="text-muted-foreground">
                Curelyでできること：
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-xl">📝</span>
                  <span>日記を書いて気持ちを記録</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">🌸</span>
                  <span>呼吸法で心を落ち着ける</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">💝</span>
                  <span>かわいいキャラクターがあなたを応援</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">📊</span>
                  <span>心の状態を可視化して管理</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button 
            onClick={() => setStep(2)} 
            size="lg"
            className="text-xl px-12 py-6 rounded-full shadow-xl"
          >
            はじめる
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Character Selection
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-accent/20 via-background to-secondary/30">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
          キャラクターを選ぼう！
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl w-full">
          {characters.map((character) => {
            const isSelected = selectedCharacter === character.id;
            
            return (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character.id)}
                className={`
                  relative p-6 rounded-[2rem] border-4 transition-all duration-300
                  ${isSelected 
                    ? "scale-110 border-primary shadow-2xl shadow-primary/50" 
                    : "border-border hover:border-primary/50 hover:scale-105"
                  }
                  bg-card/90 backdrop-blur-sm
                `}
                style={{
                  boxShadow: isSelected 
                    ? `0 0 40px ${character.color}40, 0 0 80px ${character.color}20` 
                    : undefined,
                }}
              >
                <div className={`
                  relative w-full aspect-square mb-4 rounded-full overflow-hidden
                  ${isSelected ? "animate-bounce-in" : ""}
                `}>
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                    <span>{character.emoji}</span>
                    <span>{character.name}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {character.description}
                  </p>
                  <p className="text-lg text-foreground font-medium">
                    {character.greeting}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleCharacterConfirm}
          disabled={!selectedCharacter}
          size="lg"
          className="text-xl px-12 py-6 rounded-full shadow-xl disabled:opacity-50"
        >
          このキャラクターに決定！
        </Button>

        {showCharacterConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-fade-in">
            <div className="text-center space-y-6 animate-scale-in">
              <div className="text-6xl animate-bounce-in">
                {characters.find(c => c.id === selectedCharacter)?.emoji}
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                {characters.find(c => c.id === selectedCharacter)?.name}を選んでくれてありがとう！
              </h2>
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent opacity-30 blur-3xl animate-pulse-soft" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Profile Information
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/20 via-background to-secondary/30 p-4">
      <Card className="w-full max-w-2xl bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl">初期設定</CardTitle>
          <CardDescription className="text-lg">
            あなたについて教えてください（任意項目も含みます）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="age">年齢</Label>
              <Input
                id="age"
                type="number"
                placeholder="例：25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
                min="0"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label>パニック障害の診断を受けていますか？</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={diagnosed === true ? "default" : "outline"}
                  onClick={() => setDiagnosed(true)}
                  disabled={loading}
                >
                  はい
                </Button>
                <Button
                  type="button"
                  variant={diagnosed === false ? "default" : "outline"}
                  onClick={() => setDiagnosed(false)}
                  disabled={loading}
                >
                  いいえ
                </Button>
              </div>
            </div>

            {diagnosed && (
              <div className="space-y-2">
                <Label htmlFor="diagnosisYear">診断を受けた年（おおよそ）</Label>
                <Input
                  id="diagnosisYear"
                  type="number"
                  placeholder="例：2020"
                  value={diagnosisYear}
                  onChange={(e) => setDiagnosisYear(e.target.value)}
                  disabled={loading}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>現在、通院していますか？</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={currentlyTreating === true ? "default" : "outline"}
                  onClick={() => setCurrentlyTreating(true)}
                  disabled={loading}
                >
                  はい
                </Button>
                <Button
                  type="button"
                  variant={currentlyTreating === false ? "default" : "outline"}
                  onClick={() => setCurrentlyTreating(false)}
                  disabled={loading}
                >
                  いいえ
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggers">発作のきっかけ・トリガー（任意）</Label>
              <Textarea
                id="triggers"
                placeholder="例：人混み、電車、締め切った部屋など"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              始める
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;