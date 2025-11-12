import curaCharacter from "@/assets/cura-character.png";
import suuCharacter from "@/assets/suu-character.png";
import lunoCharacter from "@/assets/luno-character.png";

export type CharacterId = "cura" | "suu" | "luno";

export interface CharacterData {
  id: CharacterId;
  name: string;
  emoji: string;
  greeting: string;
  color: string;
  image: string;
  description: string;
}

export const characters: CharacterData[] = [
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

export const getCharacterById = (id: CharacterId | null): CharacterData => {
  const character = characters.find((c) => c.id === id);
  return character || characters[0]; // Default to Cura
};
