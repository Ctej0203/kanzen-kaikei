import moodSad from "@/assets/mood-sad.png";
import moodNormal from "@/assets/mood-normal.png";
import moodHappy from "@/assets/mood-happy.png";
import moodLunoSad from "@/assets/mood-luno-sad.png";
import moodLunoNormal from "@/assets/mood-luno-normal.png";
import moodLunoHappy from "@/assets/mood-luno-happy.png";
import moodCuraSad from "@/assets/mood-cura-sad.png";
import moodCuraNormal from "@/assets/mood-cura-normal.png";
import moodCuraHappy from "@/assets/mood-cura-happy.png";

export const moodExpressions = [
  { id: "sad", label: "悲しい", image: moodSad },
  { id: "normal", label: "普通", image: moodNormal },
  { id: "happy", label: "楽しい", image: moodHappy },
] as const;

export const moodExpressionsLuno = [
  { id: "sad", label: "悲しい", image: moodLunoSad },
  { id: "normal", label: "普通", image: moodLunoNormal },
  { id: "happy", label: "楽しい", image: moodLunoHappy },
] as const;

export const moodExpressionsCura = [
  { id: "sad", label: "悲しい", image: moodCuraSad },
  { id: "normal", label: "普通", image: moodCuraNormal },
  { id: "happy", label: "楽しい", image: moodCuraHappy },
] as const;

export const getMoodExpressionsByCharacter = (characterId: string | null) => {
  if (characterId === "luno") {
    return moodExpressionsLuno;
  }
  if (characterId === "cura") {
    return moodExpressionsCura;
  }
  return moodExpressions;
};

export const getMoodExpressionById = (id: string | null) => {
  if (!id) return null;
  return moodExpressions.find((expr) => expr.id === id) || null;
};
