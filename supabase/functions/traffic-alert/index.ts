import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALERT_EMAIL = "seq.taylor@gmail.com";
const DAILY_THRESHOLD = 50;
const SPIKE_MULTIPLIER = 3;

// Rough cost estimates per AI call (Lovable AI gateway)
const ESTIMATED_COST_PER_AI_CALL = 0.003; // ~$0.003 per Gemini Flash call

const COUNTRY_NAMES: Record<string, string> = {
  US: "🇺🇸 US", GB: "🇬🇧 UK", CA: "🇨🇦 CA", AU: "🇦🇺 AU", DE: "🇩🇪 DE",
  FR: "🇫🇷 FR", ES: "🇪🇸 ES", MX: "🇲🇽 MX", BR: "🇧🇷 BR", NL: "🇳🇱 NL",
  BG: "🇧🇬 BG", IN: "🇮🇳 IN", JP: "🇯🇵 JP", KR: "🇰🇷 KR", CN: "🇨🇳 CN",
  IT: "🇮🇹 IT", PT: "🇵🇹 PT", AR: "🇦🇷 AR", CO: "🇨🇴 CO", PH: "🇵🇭 PH",
  NG: "🇳🇬 NG", ZA: "🇿🇦 ZA", XX: "🌐 Unknown",
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
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);
    const now = new Date();

    // Current: last 30 days. Baseline: 30-60 days ago.
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - 30);
    const baselineStart = new Date(now);
    baselineStart.setDate(baselineStart.getDate() - 60);

    // Session counts
    const { count: currentCount } = await supabase
      .from("sessions").select("*", { count: "exact", head: true })
      .gte("created_at", currentStart.toISOString());
    const { count: baselineCount } = await supabase
      .from("sessions").select("*", { count: "exact", head: true })
      .gte("created_at", baselineStart.toISOString())
      .lt("created_at", currentStart.toISOString());

    // Geo stats with city/region
    const { data: geoData } = await supabase
      .from("daily_country_stats")
      .select("country_code, region, city, request_count")
      .gte("stat_date", currentStart.toISOString().split("T")[0])
      .order("request_count", { ascending: false });

    // Usage stats for cost estimation
    const { data: usageData } = await supabase
      .from("daily_usage_stats")
      .select("call_type, call_count")
      .gte("stat_date", currentStart.toISOString().split("T")[0]);

    // Aggregate geo by country
    const countryTotals: Record<string, number> = {};
    const locationDetails: { location: string; count: number }[] = [];
    for (const row of geoData || []) {
      countryTotals[row.country_code] = (countryTotals[row.country_code] || 0) + row.request_count;
      const loc = [
        row.city !== "Unknown" ? row.city : null,
        row.region !== "Unknown" ? row.region : null,
        getCountryName(row.country_code),
      ].filter(Boolean).join(", ");
      locationDetails.push({ location: loc, count: row.request_count });
    }
    locationDetails.sort((a, b) => b.count - a.count);
    const totalGeoRequests = locationDetails.reduce((s, r) => s + r.count, 0);

    // Aggregate usage stats
    const usageTotals: Record<string, number> = {};
    let totalAICalls = 0;
    for (const row of usageData || []) {
      usageTotals[row.call_type] = (usageTotals[row.call_type] || 0) + row.call_count;
      totalAICalls += row.call_count;
    }
    const estimatedAICost = totalAICalls * ESTIMATED_COST_PER_AI_CALL;

    const current = currentCount ?? 0;
    const baseline = baselineCount ?? 0;
    const dailyAvg = Math.round(current / 30);
    const baselineDailyAvg = baseline > 0 ? Math.round(baseline / 30) : 0;

    const alerts: string[] = [];
    if (dailyAvg >= DAILY_THRESHOLD) {
      alerts.push(`📈 <strong>High traffic:</strong> ${dailyAvg} avg daily sessions (threshold: ${DAILY_THRESHOLD})`);
    }
    if (baseline > 0 && current >= baseline * SPIKE_MULTIPLIER) {
      alerts.push(`🚀 <strong>Traffic spike:</strong> ${current} sessions vs ${baseline} baseline (${Math.round(current / baseline)}x increase)`);
    }
    if (baseline > 10 && current < baseline * 0.2) {
      alerts.push(`⚠️ <strong>Traffic drop:</strong> ${current} sessions vs ${baseline} baseline (${Math.round((1 - current / baseline) * 100)}% decrease)`);
    }
    // Cost alert
    if (estimatedAICost > 100) {
      alerts.push(`💰 <strong>Cost alert:</strong> Estimated AI costs $${estimatedAICost.toFixed(2)} this month (${totalAICalls} calls) — exceeds $100 threshold`);
    }

    const result = {
      currentPeriodSessions: current,
      baselinePeriodSessions: baseline,
      dailyAverage: dailyAvg,
      alertsTriggered: alerts.length,
      totalAICalls,
      estimatedAICost: `$${estimatedAICost.toFixed(2)}`,
      countries: countryTotals,
      timestamp: now.toISOString(),
    };

    // Only email on spikes
    if (alerts.length === 0) {
      console.log("No alerts — skipping email");
      return new Response(JSON.stringify({ success: true, emailSent: false, ...result }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Build location rows (top 15)
    const topLocations = locationDetails.slice(0, 15);
    const locationRows = topLocations.length > 0
      ? topLocations.map((r) => {
          const pct = totalGeoRequests > 0 ? Math.round((r.count / totalGeoRequests) * 100) : 0;
          return `<tr>
            <td style="padding: 6px 12px; border: 1px solid #dee2e6;">${r.location}</td>
            <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">${r.count}</td>
            <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">${pct}%</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="3" style="padding: 8px; border: 1px solid #dee2e6; color: #999; text-align: center;">No geo data yet</td></tr>`;

    // Build usage breakdown rows
    const usageRows = Object.entries(usageTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => `<tr>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">${type}</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">${count}</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">~$${(count * ESTIMATED_COST_PER_AI_CALL).toFixed(3)}</td>
      </tr>`).join("") || `<tr><td colspan="3" style="padding: 8px; border: 1px solid #dee2e6; color: #999; text-align: center;">No usage data yet</td></tr>`;

    await resend.emails.send({
      from: "HeyGetOnMyLevel <onboarding@resend.dev>",
      to: [ALERT_EMAIL],
      subject: `🚨 Traffic Alert — HeyGetOnMyLevel (${dailyAvg} avg/day, ~$${estimatedAICost.toFixed(2)} est.)`,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">🚨 Traffic & Cost Alert</h2>
          
          <div style="background: #fff3cd; padding: 16px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 16px 0;">
            ${alerts.map((a) => `<p style="margin: 8px 0;">${a}</p>`).join("")}
          </div>

          <h3 style="color: #333;">📊 Sessions (30-day window)</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Current Period</strong></td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${current} sessions (${dailyAvg}/day)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Previous Period</strong></td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${baseline} sessions (${baselineDailyAvg}/day)</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;"><strong>Change</strong></td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">${baseline > 0 ? `${current > baseline ? "+" : ""}${Math.round(((current - baseline) / baseline) * 100)}%` : "N/A"}</td>
            </tr>
          </table>

          <h3 style="color: #333;">💰 Estimated AI Costs</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px 12px; text-align: left;">Call Type</th>
              <th style="padding: 8px 12px; text-align: right;">Count</th>
              <th style="padding: 8px 12px; text-align: right;">Est. Cost</th>
            </tr>
            ${usageRows}
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">TOTAL</td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">${totalAICalls}</td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">~$${estimatedAICost.toFixed(2)}</td>
            </tr>
          </table>
          <p style="color: #999; font-size: 11px;">Estimates based on ~$${ESTIMATED_COST_PER_AI_CALL}/call. Actual costs may vary. Check Settings → Cloud & AI balance for real charges.</p>

          <h3 style="color: #333;">🌍 Where Traffic Is Coming From</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px 12px; text-align: left;">Location</th>
              <th style="padding: 8px 12px; text-align: right;">Requests</th>
              <th style="padding: 8px 12px; text-align: right;">Share</th>
            </tr>
            ${locationRows}
          </table>
          <p style="color: #999; font-size: 11px;">${totalGeoRequests} tracked requests. Top 15 locations shown. City/state availability depends on Cloudflare headers.</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 11px;">
            Generated: ${now.toISOString()}<br/>
            Thresholds: ${DAILY_THRESHOLD} daily avg / ${SPIKE_MULTIPLIER}x spike / $100 AI cost<br/>
            Schedule: 1st of each month (spike-only)
          </p>
        </div>
      `,
    });

    console.log("Traffic alert sent with geo + cost data");

    return new Response(JSON.stringify({ success: true, emailSent: true, ...result }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in traffic-alert:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
