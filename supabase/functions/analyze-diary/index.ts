import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// キャラクター設定
const characterProfiles = {
  cura: {
    name: "Cura",
    personality: "元気で前向き、励ましてくれる明るい性格",
    tone: "明るく元気な口調で、「頑張ったね！」「素敵だよ！」などポジティブな言葉を使う",
  },
  suu: {
    name: "Suu",
    personality: "やさしくておっとりした、穏やかな性格",
    tone: "やさしく穏やかな口調で、「大丈夫だよ」「ゆっくりでいいからね」など包み込むような言葉を使う",
  },
  luno: {
    name: "Luno",
    personality: "静かで夢見るような、落ち着いた性格",
    tone: "静かで落ち着いた口調で、「そうなんだね」「考えてみてね」など深く寄り添う言葉を使う",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const diarySchema = z.object({
      user_id: z.string().uuid("Invalid user ID"),
      mood_score: z.number().int("Mood score must be an integer").min(1, "Mood score must be at least 1").max(10, "Mood score must be at most 10"),
      memo: z.string().trim().max(1000, "Memo too long (max 1000 characters)").optional(),
      character_id: z.enum(["cura", "suu", "luno"]).default("cura")
    });

    const requestBody = await req.json();
    const validated = diarySchema.parse(requestBody);
    const { user_id, mood_score, memo, character_id } = validated;
    
    console.log("Analyzing diary:", { user_id, mood_score, memo, character_id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // キャラクター情報を取得
    const character = characterProfiles[character_id as keyof typeof characterProfiles] || characterProfiles.cura;

    // 最近の記録を取得
    const { data: recentRecords } = await supabase
      .from("symptom_records")
      .select("mood_score, recorded_at")
      .eq("user_id", user_id)
      .order("recorded_at", { ascending: false })
      .limit(7);

    const recentScores = recentRecords?.map(r => r.mood_score) || [];
    const averageScore = recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : mood_score;

    const prompt = `あなたは${character.name}です。

【キャラクター設定】
${character.personality}
${character.tone}

ユーザーが今日の記録を書きました。以下の情報に基づいて、${character.name}としてコメントしてください。

今日の気分スコア: ${mood_score}/10
最近の平均スコア: ${averageScore.toFixed(1)}/10
日記の内容: ${memo || "メモなし"}

【タスク】
1. AI評価スコア（1-10）を付けてください
   - 気分スコアとメモの内容を総合的に判断
   - ネガティブな内容でも、記録したこと自体を評価
   
2. ${character.name}として、短いコメント（2-3文）を書いてください
   - ユーザーの気持ちに寄り添う
   - ${character.name}らしい口調と性格を反映
   - 必要に応じて優しいアドバイスを含める

JSON形式で応答してください：
{
  "ai_score": number,
  "ai_comment": "string"
}`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error("Failed to get AI response");
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;

    // JSON レスポンスをパース
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-diary function:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: "入力データが無効です。",
          details: error.errors.map(e => e.message).join(", "),
          ai_score: null,
          ai_comment: null
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: "分析中にエラーが発生しました。後でもう一度お試しください。",
        ai_score: null,
        ai_comment: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
