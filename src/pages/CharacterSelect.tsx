import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { characters, CharacterId } from "@/lib/characterData";
import { useCharacter } from "@/hooks/useCharacter";

const CharacterSelect = () => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const { setSelectedCharacter } = useCharacter();

  const handleCharacterSelect = (characterId: CharacterId) => {
    setSelectedCharacterId(characterId);
  };

  const handleConfirm = async () => {
    if (selectedCharacterId) {
      setShowConfirmation(true);
      
      // Update global character state
      await setSelectedCharacter(selectedCharacterId);
      
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
      <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-5xl w-full px-2">
        {characters.map((character) => {
          const isSelected = selectedCharacterId === character.id;
          
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
        disabled={!selectedCharacterId}
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
              {characters.find(c => c.id === selectedCharacterId)?.emoji}
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
