import moodSad from "@/assets/mood-sad.png";
import moodNormal from "@/assets/mood-normal.png";
import moodHappy from "@/assets/mood-happy.png";

export const moodExpressions = [
  { id: "sad", label: "悲しい", image: moodSad },
  { id: "normal", label: "普通", image: moodNormal },
  { id: "happy", label: "楽しい", image: moodHappy },
] as const;

export const getMoodExpressionById = (id: string | null) => {
  if (!id) return null;
  return moodExpressions.find((expr) => expr.id === id) || null;
};
