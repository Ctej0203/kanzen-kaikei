import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FollowupUser {
  user_id: string;
  email: string;
  last_login_at: string;
  last_email_sent_at: string;
  followup_due_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting follow-up email job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current timestamp
    const now = new Date();

    console.log("Fetching users needing follow-up...");

    // Fetch users who:
    // 1. needs_followup = true
    // 2. followup_due_at <= today
    // 3. last_login_at < last_email_sent_at + 1 day (didn't log in within 24 hours of email)
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, last_login_at, last_email_sent_at, followup_due_at")
      .eq("needs_followup", true)
      .lte("followup_due_at", now.toISOString());

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    console.log(`Found ${profiles?.length || 0} users with follow-up scheduled`);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users needing follow-up found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter users who didn't log in within 24 hours after last email
    const usersToEmail = profiles.filter((profile) => {
      if (!profile.last_email_sent_at || !profile.last_login_at) {
        return false;
      }

      const lastEmailDate = new Date(profile.last_email_sent_at);
      const lastLoginDate = new Date(profile.last_login_at);
      const emailPlus24Hours = new Date(lastEmailDate.getTime() + 24 * 60 * 60 * 1000);

      // User didn't log in within 24 hours after email was sent
      return lastLoginDate < emailPlus24Hours;
    });

    console.log(`Sending follow-up emails to ${usersToEmail.length} users`);

    // Get user emails from auth.users
    const userIds = usersToEmail.map(p => p.user_id);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw authError;
    }

    const emailsToSend: FollowupUser[] = [];
    
    for (const profile of usersToEmail) {
      const authUser = authUsers.users.find(u => u.id === profile.user_id);
      if (authUser?.email) {
        emailsToSend.push({
          user_id: profile.user_id,
          email: authUser.email,
          last_login_at: profile.last_login_at,
          last_email_sent_at: profile.last_email_sent_at,
          followup_due_at: profile.followup_due_at
        });
      }
    }

    // Send follow-up emails and update database
    const results = [];
    for (const user of emailsToSend) {
      try {
        console.log(`Sending follow-up email to ${user.email}`);
        
        const emailResponse = await resend.emails.send({
          from: "Curely <onboarding@resend.dev>",
          to: [user.email],
          subject: "大丈夫ですか？ - Curelyはいつでもここにいます",
          html: `
            <h1>こんにちは</h1>
            <p>先週お送りしたメッセージから時間が経ちましたが、お元気ですか？</p>
            <p>心の健康は毎日のケアが大切です。Curelyでは、あなたをサポートするための様々な機能を用意しています。</p>
            <p>気分がすぐれないとき、不安を感じるとき、いつでもCurelyがあなたのそばにいます。</p>
            <ul>
              <li>AIチャットで気持ちを共有</li>
              <li>呼吸法で心を落ち着ける</li>
              <li>専門家とのオンライン診療</li>
            </ul>
            <p>あなたの心の健康を第一に考えています。ぜひログインして、サポートを受けてください。</p>
            <p>Curelyチーム</p>
          `,
        });

        console.log("Follow-up email sent successfully:", emailResponse);

        // Update user profile - reset follow-up flag
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            last_email_sent_at: now.toISOString(),
            needs_followup: false,
            followup_due_at: null
          })
          .eq("user_id", user.user_id);

        if (updateError) {
          console.error(`Error updating profile for ${user.email}:`, updateError);
          throw updateError;
        }

        results.push({ email: user.email, status: "sent" });
      } catch (error) {
        console.error(`Error sending follow-up email to ${user.email}:`, error);
        results.push({ email: user.email, status: "failed", error: String(error) });
      }
    }

    console.log("Follow-up job completed. Results:", results);

    return new Response(
      JSON.stringify({ 
        message: "Follow-up email job completed",
        emailsSent: results.filter(r => r.status === "sent").length,
        emailsFailed: results.filter(r => r.status === "failed").length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-followup-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);