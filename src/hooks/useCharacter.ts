import { useContext } from "react";
import { CharacterContext } from "@/contexts/CharacterContext";

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
};
