import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `あなたは優しいメンタルヘルスカウンセラーです。
ユーザーの日記を分析し、メンタルスコア（0-100点）と温かいコメントを返してください。

分析基準：
- ポジティブな言葉（嬉しい、楽しい、感謝など）が多い → 高スコア
- ネガティブな言葉（辛い、悲しい、疲れたなど）が多い → 低スコア
- 中立的な内容 → 50点前後

コメント例：
- 高スコア: "今日は素敵な1日だったみたいだね！その調子で頑張ってね✨"
- 中スコア: "今日もお疲れ様。ゆっくり休んでね😊"
- 低スコア: "今日は少し疲れたね。無理せず、自分にやさしくしてあげてね💕"

必ず以下のJSON形式で返してください：
{"score": <0-100の数値>, "comment": "<温かいコメント>"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `以下の日記を分析してください：\n\n${memo}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "レート制限を超えました。しばらく待ってから再度お試しください。" }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "クレジットが不足しています。" }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI分析エラー" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content);

    return new Response(
      JSON.stringify({ 
        score: Math.max(0, Math.min(100, result.score)), 
        comment: result.comment 
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-diary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "不明なエラー" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
