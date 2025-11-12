import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    greeting: "Suuだよ🩵",
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

const CharacterSelect = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleCharacterSelect = (characterId: Character) => {
    setSelectedCharacter(characterId);
  };

  const handleConfirm = () => {
    if (selectedCharacter) {
      setShowConfirmation(true);
      // Save to localStorage
      localStorage.setItem("selectedCharacter", selectedCharacter);
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-accent/20 via-background to-secondary/30">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
        キャラクターを選ぼう！
      </h1>

      {/* Character Cards */}
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
              {/* Character Image */}
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

              {/* Character Info */}
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

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <span className="text-2xl">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!selectedCharacter}
        size="lg"
        className="text-xl px-12 py-6 rounded-full shadow-xl disabled:opacity-50"
      >
        このキャラクターに決定！
      </Button>

      {/* Confirmation Effect */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 animate-fade-in">
          <div className="text-center space-y-6 animate-scale-in">
            <div className="text-6xl animate-bounce-in">
              {characters.find(c => c.id === selectedCharacter)?.emoji}
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              この子に決めた！
            </h2>
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent opacity-30 blur-3xl animate-pulse-soft" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelect;
