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
const DAILY_THRESHOLD = 50;
const SPIKE_MULTIPLIER = 3;

// Country code to flag/name mapping
const COUNTRY_NAMES: Record<string, string> = {
  US: "🇺🇸 United States", GB: "🇬🇧 United Kingdom", CA: "🇨🇦 Canada",
  AU: "🇦🇺 Australia", DE: "🇩🇪 Germany", FR: "🇫🇷 France",
  ES: "🇪🇸 Spain", MX: "🇲🇽 Mexico", BR: "🇧🇷 Brazil",
  NL: "🇳🇱 Netherlands", BG: "🇧🇬 Bulgaria", IN: "🇮🇳 India",
  JP: "🇯🇵 Japan", KR: "🇰🇷 South Korea", CN: "🇨🇳 China",
  IT: "🇮🇹 Italy", PT: "🇵🇹 Portugal", AR: "🇦🇷 Argentina",
  CO: "🇨🇴 Colombia", CL: "🇨🇱 Chile", PE: "🇵🇪 Peru",
  PH: "🇵🇭 Philippines", NG: "🇳🇬 Nigeria", ZA: "🇿🇦 South Africa",
  XX: "🌐 Unknown",
};

const getCountryName = (code: string) => COUNTRY_NAMES[code] || `🏳️ ${code}`;

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

    // Current period: last 30 days
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 30);

    // Baseline period: 30-60 days ago
    const baselineStart = new Date(now);
    baselineStart.setDate(baselineStart.getDate() - 60);

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

    // Get country stats for current period
    const { data: countryData, error: countryError } = await supabase
      .from("daily_country_stats")
      .select("country_code, request_count")
      .gte("stat_date", currentStart.toISOString().split("T")[0])
      .order("request_count", { ascending: false });

    if (countryError) throw countryError;

    // Aggregate country stats (multiple days per country)
    const countryTotals: Record<string, number> = {};
    for (const row of countryData || []) {
      countryTotals[row.country_code] = (countryTotals[row.country_code] || 0) + row.request_count;
    }
    const sortedCountries = Object.entries(countryTotals)
      .sort(([, a], [, b]) => b - a);
    const totalGeoRequests = sortedCountries.reduce((sum, [, count]) => sum + count, 0);

    const current = currentCount ?? 0;
    const baseline = baselineCount ?? 0;
    const dailyAvg = Math.round(current / 30);
    const baselineDailyAvg = baseline > 0 ? Math.round(baseline / 30) : 0;

    const alerts: string[] = [];

    if (dailyAvg >= DAILY_THRESHOLD) {
      alerts.push(
        `📈 <strong>High traffic:</strong> ${dailyAvg} avg daily sessions (threshold: ${DAILY_THRESHOLD})`
      );
    }

    if (baseline > 0 && current >= baseline * SPIKE_MULTIPLIER) {
      alerts.push(
        `🚀 <strong>Traffic spike:</strong> ${current} sessions this period vs ${baseline} last period (${Math.round(current / baseline)}x increase)`
      );
    }

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
      countries: countryTotals,
      timestamp: now.toISOString(),
    };

    // Build country table rows
    const countryRows = sortedCountries.length > 0
      ? sortedCountries.map(([code, count]) => {
          const pct = totalGeoRequests > 0 ? Math.round((count / totalGeoRequests) * 100) : 0;
          return `<tr>
            <td style="padding: 6px 12px; border: 1px solid #dee2e6;">${getCountryName(code)}</td>
            <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">${count}</td>
            <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">${pct}%</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="3" style="padding: 8px 12px; border: 1px solid #dee2e6; color: #999; text-align: center;">No geo data yet — data starts collecting after deployment</td></tr>`;

    // Only send email if there are alerts (spike-only mode)
    if (alerts.length === 0) {
      console.log("No alerts triggered — skipping email (spike-only mode)");
      return new Response(JSON.stringify({ success: true, emailSent: false, ...result }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const subject = `🚨 Traffic Alert — HeyGetOnMyLevel (${dailyAvg} avg/day)`;

    console.log(`Sending traffic alert with ${alerts.length} alert(s)`);

    await resend.emails.send({
      from: "HeyGetOnMyLevel <onboarding@resend.dev>",
      to: [ALERT_EMAIL],
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">🚨 Traffic Alert</h2>
          
          <div style="background: #fff3cd; padding: 16px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 16px 0;">
            ${alerts.map((a) => `<p style="margin: 8px 0;">${a}</p>`).join("")}
          </div>

          <h3 style="color: #333; margin-top: 24px;">📊 Session Summary (15-day period)</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Current Period</strong></td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${current} sessions (${dailyAvg}/day avg)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Previous Period</strong></td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${baseline} sessions (${baselineDailyAvg}/day avg)</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Change</strong></td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${baseline > 0 ? `${current > baseline ? "+" : ""}${Math.round(((current - baseline) / baseline) * 100)}%` : "N/A (no baseline)"}</td>
            </tr>
          </table>

          <h3 style="color: #333; margin-top: 24px;">🌍 Traffic by Country</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px 12px; text-align: left;">Country</th>
              <th style="padding: 8px 12px; text-align: right;">Requests</th>
              <th style="padding: 8px 12px; text-align: right;">Share</th>
            </tr>
            ${countryRows}
          </table>
          <p style="color: #999; font-size: 12px;">Country data based on ${totalGeoRequests} tracked requests via edge functions.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">
            Generated: ${now.toISOString()}<br/>
            Alert thresholds: ${DAILY_THRESHOLD} daily avg / ${SPIKE_MULTIPLIER}x spike multiplier<br/>
            Schedule: 1st & 15th of each month
          </p>
        </div>
      `,
    });

    console.log("Traffic report email sent successfully");

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
