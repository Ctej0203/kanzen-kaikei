import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id } = await req.json();

    if (!message || !user_id) {
      throw new Error("Message and user_id are required");
    }

    // Supabaseクライアント作成
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // プレミアムステータス確認
    const { data: subscription } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "active")
      .maybeSingle();

    const isPremium = !!subscription;

    // 非プレミアムの場合、クォータ確認
    if (!isPremium) {
      const { data: quota } = await supabaseClient
        .from("ai_quota")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (quota && quota.free_messages_used >= 100) {
        return new Response(
          JSON.stringify({ error: "Monthly message limit reached" }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Lovable AI呼び出し
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `あなたはCura（キュア）という名前の、優しく共感的なAIコンパニオンです。
ユーザーはメンタルヘルスの課題を抱えています。
認知行動療法的なアプローチで、ポジティブで支援的な対話を心がけてください。
以下の点に注意してください：
- 温かく共感的な態度で接する
- ユーザーの感情を受け止め、肯定する
- 具体的で実践可能なアドバイスを提供する
- 医療行為は行えないことを理解する
- 緊急時は専門家受診を促す
- 50文字以内の簡潔な応答を心がける`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    // 危機的表現検知
    const crisisKeywords = ["死にたい", "自殺", "消えたい", "生きてる意味", "死んだ方がいい"];
    const hasCrisis = crisisKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword) || responseText.toLowerCase().includes(keyword)
    );

    // 会話履歴保存
    await supabaseClient.from("ai_conversations").insert({
      user_id,
      message,
      response: responseText,
      tokens_used: tokensUsed,
    });

    // 非プレミアムの場合、クォータをインクリメント
    if (!isPremium) {
      await supabaseClient.rpc("increment_ai_quota", {
        p_user_id: user_id,
      });
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        hasCrisis,
        tokensUsed,
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
