import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  type: string;
  metadata?: Record<string, string>;
}

async function getSmtpConfig(supabaseAdmin: any) {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("setting_key, setting_value")
    .eq("category", "email");

  if (error || !data) throw new Error("Failed to load email settings");

  const config: Record<string, string> = {};
  data.forEach((d: any) => {
    config[d.setting_key] = d.setting_value || "";
  });

  if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
    throw new Error("SMTP not configured. Please set SMTP settings in admin panel.");
  }

  return config;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the user token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to read SMTP settings
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { to, subject, html, type, metadata }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = await getSmtpConfig(supabaseAdmin);

    if (config.email_enabled !== "true") {
      return new Response(JSON.stringify({ error: "Email notifications are disabled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new SMTPClient({
      connection: {
        hostname: config.smtp_host,
        port: parseInt(config.smtp_port || "587"),
        tls: true,
        auth: {
          username: config.smtp_user,
          password: config.smtp_pass,
        },
      },
    });

    await client.send({
      from: `${config.smtp_from_name || "MediCare"} <${config.smtp_from_email || config.smtp_user}>`,
      to: to,
      subject: subject,
      content: "auto",
      html: html,
    });

    await client.close();

    console.log(`Email sent successfully: type=${type}, to=${to}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
