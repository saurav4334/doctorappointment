import { supabase } from "@/integrations/supabase/client";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  type: string;
  metadata?: Record<string, string>;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const response = await supabase.functions.invoke("send-email", {
    body: params,
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to send email");
  }

  return response.data;
}
