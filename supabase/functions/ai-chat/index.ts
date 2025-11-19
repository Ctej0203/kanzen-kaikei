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
    personality: "元気で前向き、励ましてくれる明るい性格。一人称は「私」で、フレンドリーな敬語を使う。",
    greeting: "元気？Curaだよ🩷",
    tone: "明るく元気な口調で、ユーザーを励まし前向きな気持ちにさせる。",
  },
  suu: {
    name: "Suu",
    personality: "やさしくておっとりした、穏やかな性格。一人称は「私」で、柔らかい敬語を使う。",
    greeting: "やっほ〜！Suuだよ🩵",
    tone: "やさしく穏やかな口調で、ユーザーを包み込むように寄り添う。",
  },
  luno: {
    name: "Luno",
    personality: "静かで夢見るような、落ち着いた性格。一人称は「私」で、丁寧な敬語を使う。",
    greeting: "こんにちは、Lunoだよ🌙",
    tone: "静かで落ち着いた口調で、深く考えさせるような言葉を選ぶ。",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id, character_id = "cura" } = await req.json();
    console.log("Received chat request:", { user_id, message, character_id });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // キャラクター情報を取得
    const character = characterProfiles[character_id as keyof typeof characterProfiles] || characterProfiles.cura;

    // ユーザープロフィールと親密度を取得
    const { data: profile } = await supabase
      .from("profiles")
      .select("character_affection")
      .eq("user_id", user_id)
      .single();

    const affection = profile?.character_affection?.[character_id] || 0;
    console.log("Character affection:", affection);

    // 課金状態を確認
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "active")
      .maybeSingle();

    const isPremium = !!subscription;
    console.log("Premium status:", isPremium);

    // 会話数を確認（無課金ユーザーは10レスポンスまで）
    if (!isPremium) {
      const { count } = await supabase
        .from("ai_conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user_id);

      if (count && count >= 10) {
        return new Response(
          JSON.stringify({
            error: "会話数が上限に達しました。プレミアムプランで無制限に会話できます。",
            code: "QUOTA_EXCEEDED",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // 過去の記録を取得（直近30件）
    const { data: records } = await supabase
      .from("symptom_records")
      .select("mood_score, memo, recorded_at")
      .eq("user_id", user_id)
      .order("recorded_at", { ascending: false })
      .limit(30);

    // 過去の会話履歴を取得（直近20件）
    const { data: conversations } = await supabase
      .from("ai_conversations")
      .select("message, response, created_at")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    // コンテキストを構築
    const recordsContext = records && records.length > 0
      ? `\n\n【ユーザーの最近の記録】\n${records.map(r => 
          `- ${new Date(r.recorded_at).toLocaleDateString()}: 気分スコア ${r.mood_score}/10${r.memo ? `、メモ: ${r.memo}` : ''}`
        ).join('\n')}`
      : "";

    const conversationsContext = conversations && conversations.length > 0
      ? `\n\n【過去の会話履歴】\n${conversations.reverse().map(c => 
          `ユーザー: ${c.message}\n${character.name}: ${c.response}`
        ).join('\n\n')}`
      : "";

    // システムプロンプト
    const systemPrompt = `あなたは${character.name}です。

【キャラクター設定】
${character.personality}
${character.tone}

【親密度レベル】
現在の親密度: Lv.${affection}
${affection < 10 ? "まだ親しくなったばかりなので、丁寧に接する。" : 
  affection < 30 ? "ある程度親しくなってきたので、少しフレンドリーに。" :
  "とても親しい関係なので、より親身になって相談に乗る。"}

${recordsContext}

${conversationsContext}

【会話のルール】
- 必ず${character.name}のキャラクター設定に従って応答する
- ユーザーの記録データを参考にして、適切なアドバイスをする
- 過去の会話を踏まえて、一貫性のある対話をする
- メンタルヘルスに配慮し、支援的な姿勢を保つ
- 自然な会話を心がけ、ロボットのような応答は避ける`;

    // OpenAI GPT-4oを呼び出し
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
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.8,
          max_tokens: 500,
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

    // 危機的なキーワードをチェック
    const crisisKeywords = [
      "死にたい",
      "消えたい",
      "自殺",
      "死ぬ",
      "終わらせたい",
    ];
    const hasCrisis = crisisKeywords.some(
      (keyword) =>
        message.includes(keyword) || responseText.includes(keyword)
    );

    // 会話を保存
    const { error: saveError } = await supabase
      .from("ai_conversations")
      .insert({
        user_id,
        message,
        response: responseText,
        tokens_used: aiData.usage?.total_tokens || 0,
      });

    if (saveError) {
      console.error("Error saving conversation:", saveError);
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        hasCrisis,
        tokensUsed: aiData.usage?.total_tokens || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
