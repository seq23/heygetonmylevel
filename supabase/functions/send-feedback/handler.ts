// send-feedback: emails the operator through Resend (paid quota). Guarded like every
// paid function: caller check, per-caller limits, global daily ceiling. The message
// is HTML-escaped and capped, the recipient is fixed (OWNER_ALERT_EMAIL secret, never
// in this public repo), so it cannot be used as a relay or to inject markup.
import { guardPaid, json, corsFor, escapeHtml, type GuardDeps } from "../_shared/guard.ts";

export interface FeedbackDeps extends GuardDeps {
  sendEmail: (msg: { from: string; to: string[]; subject: string; html: string }) => Promise<unknown>;
}

export const LIMITS = { name: "send-feedback", perCallerPerHour: 5, perCallerPerDay: 20, globalPerDay: 100 };

const TYPES: Record<string, { emoji: string; label: string }> = {
  bug: { emoji: "🐛", label: "Bug Report" },
  feature: { emoji: "💡", label: "Feature Request" },
  general: { emoji: "💬", label: "General Feedback" },
};

export function makeHandler(deps: FeedbackDeps) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsFor(req) });
    if (req.method !== "POST") return json(req, 405, { error: "POST only" });

    const gate = await guardPaid(req, LIMITS, deps);
    if (gate instanceof Response) return gate;

    let body: { type?: unknown; message?: unknown; url?: unknown };
    try {
      body = await req.json();
    } catch {
      return json(req, 400, { error: "Invalid JSON" });
    }
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return json(req, 400, { error: "Message is required" });
    if (message.length > 4000) return json(req, 413, { error: "Message too long" });
    const url = typeof body.url === "string" ? body.url.slice(0, 500) : "N/A";
    const t = TYPES[typeof body.type === "string" ? body.type : ""] || TYPES.general;

    const to = deps.env("OWNER_ALERT_EMAIL");
    if (!to) {
      console.error("OWNER_ALERT_EMAIL_MISSING: set the OWNER_ALERT_EMAIL function secret");
      return json(req, 503, { error: "Feedback is temporarily unavailable.", stop: "OWNER_ALERT_EMAIL_MISSING" });
    }

    try {
      await deps.sendEmail({
        from: "Reading App <onboarding@resend.dev>",
        to: [to],
        subject: `${t.emoji} ${t.label} - Reading App`,
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${t.emoji} ${t.label}</h2>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
          <p style="color: #666; font-size: 12px;">
            <strong>URL:</strong> ${escapeHtml(url)}<br/>
            <strong>Time:</strong> ${new Date().toISOString()}
          </p>
        </div>`,
      });
      return json(req, 200, { success: true });
    } catch (error) {
      console.error("Error in send-feedback function:", error);
      return json(req, 500, { error: "Could not send feedback. Please try again later." });
    }
  };
}
