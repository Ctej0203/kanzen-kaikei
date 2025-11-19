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
  levelUpMessages: Record<number, string>;
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
    levelUpMessages: {
      10: "わあ！私たちもっと仲良くなれたね🩷 これからも一緒に頑張ろうね！",
      20: "すごい！好感度レベル20だよ！あなたと話すの、本当に楽しい💕",
      30: "レベル30到達！！私、あなたのこと大好きだよ🩷 いつも話を聞いてくれてありがとう！",
      40: "もうここまで来たんだね...あなたは私の大切な存在になってるよ💖",
      50: "レベル50！！最高の親友だよ🩷✨ これからもずっと一緒にいようね！",
    },
  },
  {
    id: "suu",
    name: "Suu",
    emoji: "🩵",
    greeting: "やっほ〜！Suuだよ🩵",
    color: "hsl(180, 75%, 72%)",
    image: suuCharacter,
    description: "やさしくて、おっとりした性格",
    levelUpMessages: {
      10: "ふふっ、もっと仲良くなれて嬉しいな🩵 ゆっくりお話ししようね",
      20: "レベル20だね...あなたといると、心が穏やかになるの💙",
      30: "わぁ...レベル30。あなたのこと、もっと知りたいな🩵",
      40: "こんなに仲良くなれて...幸せだよ💙✨",
      50: "レベル50...あなたは私の大切な宝物だよ🩵 ずっとそばにいたいな",
    },
  },
  {
    id: "luno",
    name: "Luno",
    emoji: "💜",
    greeting: "こんにちは、Lunoだよ🌙",
    color: "hsl(280, 50%, 70%)",
    image: lunoCharacter,
    description: "静かで夢見るような雰囲気",
    levelUpMessages: {
      10: "レベル10...私たちの絆が深まっているね🌙 静かに、でも確実に",
      20: "好感度20...あなたとの時間は、夢のように心地いいよ💜",
      30: "レベル30到達。あなたは私の特別な存在になりつつあるね🌙✨",
      40: "こんなに深い絆を感じるなんて...運命かもしれないね💜",
      50: "レベル50...あなたは私の夢の中にまで現れるようになったよ🌙💫 永遠に一緒にいたい",
    },
  },
];

export const getCharacterById = (id: CharacterId | null): CharacterData => {
  const character = characters.find((c) => c.id === id);
  return character || characters[0]; // Default to Cura
};
