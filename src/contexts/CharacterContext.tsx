import React, { createContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CharacterData, CharacterId, getCharacterById } from "@/lib/characterData";

interface CharacterContextType {
  selectedCharacter: CharacterData;
  setSelectedCharacter: (characterId: CharacterId) => Promise<void>;
  isLoading: boolean;
}

export const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [selectedCharacter, setSelectedCharacterState] = useState<CharacterData>(
    getCharacterById("cura")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load character from localStorage and database on mount
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        // First, try to get from localStorage for immediate display
        const localCharacterId = localStorage.getItem("selectedCharacter") as CharacterId | null;
        if (localCharacterId) {
          setSelectedCharacterState(getCharacterById(localCharacterId));
        }

        // Then, sync with database if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("selected_character")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile?.selected_character) {
            const characterId = profile.selected_character as CharacterId;
            setSelectedCharacterState(getCharacterById(characterId));
            // Sync localStorage with database
            localStorage.setItem("selectedCharacter", characterId);
          }
        }
      } catch (error) {
        console.error("Error loading character:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacter();
  }, []);

  const setSelectedCharacter = async (characterId: CharacterId) => {
    const character = getCharacterById(characterId);
    
    // Update state immediately for real-time UI update
    setSelectedCharacterState(character);
    
    // Persist to localStorage
    localStorage.setItem("selectedCharacter", characterId);

    // Persist to database if user is logged in
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ selected_character: characterId })
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("Error saving character to database:", error);
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        selectedCharacter,
        setSelectedCharacter,
        isLoading,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
