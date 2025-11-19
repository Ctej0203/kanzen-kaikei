import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InactiveUser {
  user_id: string;
  email: string;
  login_count: number;
  last_login_at: string;
  last_email_sent_at: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting inactive user email job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current timestamp
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    console.log("Fetching inactive users...");

    // Fetch users who:
    // 1. Have logged in 2 or more times (login_count >= 2)
    // 2. Haven't logged in for 3+ days
    // 3. Either never received an email OR last email was 3+ days ago
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, login_count, last_login_at, last_email_sent_at")
      .gte("login_count", 2)
      .lte("last_login_at", threeDaysAgo.toISOString());

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    console.log(`Found ${profiles?.length || 0} potentially inactive users`);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No inactive users found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter users who should receive emails
    const usersToEmail = profiles.filter((profile) => {
      if (!profile.last_email_sent_at) {
        return true; // Never sent email before
      }
      
      const lastEmailDate = new Date(profile.last_email_sent_at);
      const daysSinceLastEmail = (now.getTime() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSinceLastEmail >= 3; // At least 3 days since last email
    });

    console.log(`Sending emails to ${usersToEmail.length} users`);

    // Get user emails from auth.users
    const userIds = usersToEmail.map(p => p.user_id);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw authError;
    }

    const emailsToSend: InactiveUser[] = [];
    
    for (const profile of usersToEmail) {
      const authUser = authUsers.users.find(u => u.id === profile.user_id);
      if (authUser?.email) {
        emailsToSend.push({
          user_id: profile.user_id,
          email: authUser.email,
          login_count: profile.login_count,
          last_login_at: profile.last_login_at,
          last_email_sent_at: profile.last_email_sent_at
        });
      }
    }

    // Send emails and update database
    const results = [];
    for (const user of emailsToSend) {
      try {
        console.log(`Sending email to ${user.email}`);
        
        const emailResponse = await resend.emails.send({
          from: "Curely <onboarding@resend.dev>",
          to: [user.email],
          subject: "お久しぶりです - Curelyで心の健康をサポートしましょう",
          html: `
            <h1>お久しぶりです！</h1>
            <p>最近Curelyにログインしていないことに気づきました。</p>
            <p>あなたの心の健康は大切です。Curelyでは以下のサポートを提供しています：</p>
            <ul>
              <li>日々の気分記録</li>
              <li>AIによるサポート</li>
              <li>呼吸法ガイド</li>
              <li>オンライン診療の予約</li>
            </ul>
            <p>ぜひまたアプリにログインして、あなたの心の健康をサポートさせてください。</p>
            <p>Curelyチーム</p>
          `,
        });

        console.log("Email sent successfully:", emailResponse);

        // Calculate follow-up due date (7 days from now)
        const followupDueAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Update user profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            last_email_sent_at: now.toISOString(),
            needs_followup: true,
            followup_due_at: followupDueAt.toISOString()
          })
          .eq("user_id", user.user_id);

        if (updateError) {
          console.error(`Error updating profile for ${user.email}:`, updateError);
          throw updateError;
        }

        results.push({ email: user.email, status: "sent" });
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
        results.push({ email: user.email, status: "failed", error: String(error) });
      }
    }

    console.log("Job completed. Results:", results);

    return new Response(
      JSON.stringify({ 
        message: "Inactive user email job completed",
        emailsSent: results.filter(r => r.status === "sent").length,
        emailsFailed: results.filter(r => r.status === "failed").length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-inactive-user-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);