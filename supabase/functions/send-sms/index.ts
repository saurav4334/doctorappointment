import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  phone: string;
  message: string;
  providerId?: string;
  appointmentId?: string;
}

interface SMSProvider {
  id: string;
  name: string;
  provider_type: string;
  api_url: string;
  api_key: string;
  secret_key: string | null;
  sender_id: string | null;
  client_trans_id: string | null;
  additional_config: Record<string, unknown>;
  is_active: boolean;
  is_default: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone, message, providerId, appointmentId }: SMSRequest = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone and message are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Format phone number (ensure it starts with 88 for Bangladesh)
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "88" + formattedPhone;
    } else if (!formattedPhone.startsWith("88")) {
      formattedPhone = "88" + formattedPhone;
    }

    // Get the provider
    let provider: SMSProvider | null = null;

    if (providerId) {
      const { data } = await supabase
        .from("sms_providers")
        .select("*")
        .eq("id", providerId)
        .eq("is_active", true)
        .single();
      provider = data;
    } else {
      // Get the default active provider
      const { data } = await supabase
        .from("sms_providers")
        .select("*")
        .eq("is_active", true)
        .eq("is_default", true)
        .single();
      
      if (!data) {
        // Fallback to any active provider
        const { data: anyProvider } = await supabase
          .from("sms_providers")
          .select("*")
          .eq("is_active", true)
          .limit(1)
          .single();
        provider = anyProvider;
      } else {
        provider = data;
      }
    }

    if (!provider) {
      return new Response(
        JSON.stringify({ success: false, error: "No active SMS provider configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Sending SMS via ${provider.name} (${provider.provider_type}) to ${formattedPhone}`);

    let smsResponse: { success: boolean; messageId?: string; error?: string; rawResponse?: unknown };

    switch (provider.provider_type) {
      case "khudebarta":
        smsResponse = await sendViaKhudebarta(provider, formattedPhone, message);
        break;
      case "ssl_wireless":
        smsResponse = await sendViaSSLWireless(provider, formattedPhone, message);
        break;
      case "bdbulksms":
        smsResponse = await sendViaBDBulkSMS(provider, formattedPhone, message);
        break;
      case "muthofun":
        smsResponse = await sendViaMuthofun(provider, formattedPhone, message);
        break;
      case "infobip":
        smsResponse = await sendViaInfobip(provider, formattedPhone, message);
        break;
      default:
        smsResponse = await sendViaCustom(provider, formattedPhone, message);
    }

    // Log the SMS
    await supabase.from("sms_logs").insert({
      provider_id: provider.id,
      phone_number: formattedPhone,
      message: message,
      status: smsResponse.success ? "sent" : "failed",
      provider_message_id: smsResponse.messageId || null,
      provider_response: smsResponse.rawResponse || null,
      error_message: smsResponse.error || null,
      appointment_id: appointmentId || null,
    });

    return new Response(
      JSON.stringify({
        success: smsResponse.success,
        messageId: smsResponse.messageId,
        error: smsResponse.error,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("SMS Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Khudebarta SMS Gateway
async function sendViaKhudebarta(
  provider: SMSProvider,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string; rawResponse?: unknown }> {
  try {
    const response = await fetch(provider.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: provider.api_key,
        secretkey: provider.secret_key,
        clienttransid: provider.client_trans_id,
        callerID: provider.sender_id || "8809612345678",
        toUser: phone,
        messageContent: message,
      }),
    });

    const data = await response.json();
    console.log("Khudebarta response:", data);

    // Khudebarta returns status in response
    const success = data.Status === "0" || data.status === "success" || response.ok;
    return {
      success,
      messageId: data.MessageId || data.messageid,
      error: success ? undefined : data.Message || data.message || "SMS sending failed",
      rawResponse: data,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// SSL Wireless SMS Gateway
async function sendViaSSLWireless(
  provider: SMSProvider,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string; rawResponse?: unknown }> {
  try {
    const params = new URLSearchParams({
      api_token: provider.api_key,
      sid: provider.sender_id || "",
      msisdn: phone,
      sms: message,
      csms_id: `sms_${Date.now()}`,
    });

    const response = await fetch(`${provider.api_url}?${params.toString()}`, {
      method: "GET",
    });

    const data = await response.json();
    console.log("SSL Wireless response:", data);

    const success = data.status === "SUCCESS" || data.status_code === "200";
    return {
      success,
      messageId: data.smsinfo?.[0]?.sms_id,
      error: success ? undefined : data.error_message || "SMS sending failed",
      rawResponse: data,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// BD Bulk SMS Gateway
async function sendViaBDBulkSMS(
  provider: SMSProvider,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string; rawResponse?: unknown }> {
  try {
    const params = new URLSearchParams({
      token: provider.api_key,
      to: phone,
      message: message,
      sender_id: provider.sender_id || "",
    });

    const response = await fetch(`${provider.api_url}?${params.toString()}`, {
      method: "GET",
    });

    const text = await response.text();
    console.log("BD Bulk SMS response:", text);

    // Parse response - typically returns "1701" for success
    const success = text.includes("1701") || text.includes("success");
    return {
      success,
      error: success ? undefined : text,
      rawResponse: text,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Muthofun SMS Gateway
async function sendViaMuthofun(
  provider: SMSProvider,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string; rawResponse?: unknown }> {
  try {
    const response = await fetch(provider.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: provider.api_key,
        sender_id: provider.sender_id,
        number: phone,
        message: message,
      }),
    });

    const data = await response.json();
    console.log("Muthofun response:", data);

    const success = data.response_code === 202 || data.success === true;
    return {
      success,
      messageId: data.message_id,
      error: success ? undefined : data.error_message || "SMS sending failed",
      rawResponse: data,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Infobip SMS Gateway
async function sendViaInfobip(
  provider: SMSProvider,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string; rawResponse?: unknown }> {
  try {
    const response = await fetch(provider.api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `App ${provider.api_key}`,
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to: phone }],
            from: provider.sender_id || "InfoSMS",
            text: message,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Infobip response:", data);

    const success = data.messages?.[0]?.status?.groupName === "PENDING" || 
                    data.messages?.[0]?.status?.id <= 3;
    return {
      success,
      messageId: data.messages?.[0]?.messageId,
      error: success ? undefined : data.requestError?.serviceException?.text || "SMS sending failed",
      rawResponse: data,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Custom SMS Gateway (generic POST)
async function sendViaCustom(
  provider: SMSProvider,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string; rawResponse?: unknown }> {
  try {
    const body: Record<string, string> = {
      api_key: provider.api_key,
      phone: phone,
      message: message,
    };

    if (provider.secret_key) body.secret_key = provider.secret_key;
    if (provider.sender_id) body.sender_id = provider.sender_id;
    if (provider.client_trans_id) body.client_id = provider.client_trans_id;

    const response = await fetch(provider.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Custom provider response:", data);

    return {
      success: response.ok,
      messageId: data.message_id || data.id,
      error: response.ok ? undefined : data.error || data.message || "SMS sending failed",
      rawResponse: data,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
