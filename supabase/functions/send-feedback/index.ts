import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  type: string;
  message: string;
  url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, url }: FeedbackRequest = await req.json();

    const typeEmoji = {
      bug: "🐛",
      feature: "💡",
      general: "💬",
    }[type] || "💬";

    const typeLabel = {
      bug: "Bug Report",
      feature: "Feature Request",
      general: "General Feedback",
    }[type] || "General Feedback";

    console.log(`Sending feedback email: ${typeLabel} - ${message.substring(0, 50)}...`);

    const emailResponse = await resend.emails.send({
      from: "Reading App <onboarding@resend.dev>",
      to: ["seq.taylor@gmail.com"],
      subject: `${typeEmoji} ${typeLabel} - Reading App`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${typeEmoji} ${typeLabel}</h2>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="color: #666; font-size: 12px;">
            <strong>URL:</strong> ${url || "N/A"}<br/>
            <strong>Time:</strong> ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);