import moodSad from "@/assets/mood-sad.png";
import moodNormal from "@/assets/mood-normal.png";
import moodHappy from "@/assets/mood-happy.png";
import moodVerySad from "@/assets/mood-very-sad.png";
import moodVeryHappy from "@/assets/mood-very-happy.png";

export const moodExpressions = [
  { id: "very-sad", label: "とても悲しい", image: moodVerySad },
  { id: "sad", label: "悲しい", image: moodSad },
  { id: "normal", label: "普通", image: moodNormal },
  { id: "happy", label: "楽しい", image: moodHappy },
  { id: "very-happy", label: "とても嬉しい", image: moodVeryHappy },
] as const;

export const getMoodExpressionById = (id: string | null) => {
  if (!id) return null;
  return moodExpressions.find((expr) => expr.id === id) || null;
};
