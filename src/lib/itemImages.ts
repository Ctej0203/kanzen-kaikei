// Assets imports
import curaCharacter from "@/assets/cura-character-transparent.png";
import curaDoctor from "@/assets/cura-doctor.jpg";
import curaEnergetic from "@/assets/cura-energetic.png";
import curaGentle from "@/assets/cura-gentle.png";
import curaHappy from "@/assets/cura-happy.png";
import lunoCharacter from "@/assets/luno-character.png";
import lunoFish from "@/assets/luno-fish.png";
import lunoKomatsuna from "@/assets/luno-komatsuna.png";
import lunoMilk from "@/assets/luno-milk.png";
import lunoNatto from "@/assets/luno-natto.png";
import lunoSanta from "@/assets/luno-santa.png";
import lunoTonakai from "@/assets/luno-tonakai.png";
import suuCharacter from "@/assets/suu-character.png";
import suuDoctor from "@/assets/suu-doctor.png";
import suuEdamame from "@/assets/suu-edamame.png";
import suuMacho from "@/assets/suu-macho.png";
import suuPampukinn from "@/assets/suu-pampukinn.png";
import suuStrawberry from "@/assets/suu-strawberry.png";

// 画像マップ
export const itemImages: Record<string, string> = {
  // Cura
  "cura-default": curaCharacter,
  "cura-doctor": curaDoctor,
  "cura-energetic": curaEnergetic,
  "cura-gentle": curaGentle,
  "cura-happy": curaHappy,
  // Luno
  "luno-default": lunoCharacter,
  "luno-fish": lunoFish,
  "luno-komatsuna": lunoKomatsuna,
  "luno-milk": lunoMilk,
  "luno-natto": lunoNatto,
  "luno-santa": lunoSanta,
  "luno-tonakai": lunoTonakai,
  // Suu
  "suu-default": suuCharacter,
  "suu-doctor": suuDoctor,
  "suu-edamame": suuEdamame,
  "suu-macho": suuMacho,
  "suu-pampukinn": suuPampukinn,
  "suu-strawberry": suuStrawberry,
};

// 画像URLからasset画像を取得
export const getItemImage = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  return itemImages[imageUrl] || null;
};
