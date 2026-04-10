import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configuration
const ALERT_EMAIL = "seq.taylor@gmail.com";
const DAILY_THRESHOLD = 50; // Alert if average daily sessions exceed this
const SPIKE_MULTIPLIER = 3; // Alert if current period is 3x the baseline

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    const now = new Date();

    // Current period: last 15 days
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 15);

    // Baseline period: 15-30 days ago
    const baselineStart = new Date(now);
    baselineStart.setDate(baselineStart.getDate() - 30);

    // Count sessions in current period
    const { count: currentCount, error: currentError } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", currentStart.toISOString())
      .lte("created_at", now.toISOString());

    if (currentError) throw currentError;

    // Count sessions in baseline period
    const { count: baselineCount, error: baselineError } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", baselineStart.toISOString())
      .lt("created_at", currentStart.toISOString());

    if (baselineError) throw baselineError;

    const current = currentCount ?? 0;
    const baseline = baselineCount ?? 0;
    const dailyAvg = Math.round(current / 15);
    const baselineDailyAvg = baseline > 0 ? Math.round(baseline / 15) : 0;

    const alerts: string[] = [];

    // Check absolute threshold
    if (dailyAvg >= DAILY_THRESHOLD) {
      alerts.push(
        `📈 <strong>High traffic:</strong> ${dailyAvg} avg daily sessions (threshold: ${DAILY_THRESHOLD})`
      );
    }

    // Check spike vs baseline
    if (baseline > 0 && current >= baseline * SPIKE_MULTIPLIER) {
      alerts.push(
        `🚀 <strong>Traffic spike:</strong> ${current} sessions this period vs ${baseline} last period (${Math.round(current / baseline)}x increase)`
      );
    }

    // Also alert if there's a significant drop (could indicate issues)
    if (baseline > 10 && current < baseline * 0.2) {
      alerts.push(
        `⚠️ <strong>Traffic drop:</strong> ${current} sessions this period vs ${baseline} last period (${Math.round((1 - current / baseline) * 100)}% decrease)`
      );
    }

    const result = {
      currentPeriodSessions: current,
      baselinePeriodSessions: baseline,
      dailyAverage: dailyAvg,
      baselineDailyAverage: baselineDailyAvg,
      alertsTriggered: alerts.length,
      timestamp: now.toISOString(),
    };

    if (alerts.length > 0) {
      console.log(`Sending traffic alert with ${alerts.length} alert(s)`);

      await resend.emails.send({
        from: "HeyGetOnMyLevel <onboarding@resend.dev>",
        to: [ALERT_EMAIL],
        subject: `🚨 Traffic Alert — HeyGetOnMyLevel (${dailyAvg} avg/day)`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">🚨 Traffic Alert</h2>
            <p style="color: #555;">The following alert(s) were triggered for HeyGetOnMyLevel:</p>
            
            <div style="background: #fff3cd; padding: 16px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 16px 0;">
              ${alerts.map((a) => `<p style="margin: 8px 0;">${a}</p>`).join("")}
            </div>

            <h3 style="color: #333; margin-top: 24px;">📊 Period Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
              <tr style="background: #f8f9fa;">
                <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Current Period (last 15 days)</strong></td>
                <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${current} sessions (${dailyAvg}/day avg)</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Baseline (15-30 days ago)</strong></td>
                <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${baseline} sessions (${baselineDailyAvg}/day avg)</td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              Generated: ${now.toISOString()}<br/>
              Thresholds: ${DAILY_THRESHOLD} daily avg / ${SPIKE_MULTIPLIER}x spike multiplier
            </p>
          </div>
        `,
      });

      console.log("Traffic alert email sent successfully");
    } else {
      console.log("No alerts triggered — traffic within normal range");
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in traffic-alert function:", error);
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
