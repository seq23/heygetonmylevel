import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALERT_EMAIL = "seq.taylor@gmail.com";
const ESTIMATED_COST_PER_AI_CALL = 0.003;

const COUNTRY_NAMES: Record<string, string> = {
  US: "🇺🇸 US", GB: "🇬🇧 UK", CA: "🇨🇦 CA", AU: "🇦🇺 AU", DE: "🇩🇪 DE",
  FR: "🇫🇷 FR", ES: "🇪🇸 ES", MX: "🇲🇽 MX", BR: "🇧🇷 BR", NL: "🇳🇱 NL",
  BG: "🇧🇬 BG", IN: "🇮🇳 IN", JP: "🇯🇵 JP", KR: "🇰🇷 KR", CN: "🇨🇳 CN",
  IT: "🇮🇹 IT", PT: "🇵🇹 PT", AR: "🇦🇷 AR", CO: "🇨🇴 CO", PH: "🇵🇭 PH",
  NG: "🇳🇬 NG", ZA: "🇿🇦 ZA", XX: "🌐 Unknown",
};
const getCountryName = (code: string) => COUNTRY_NAMES[code] || `🏳️ ${code}`;

interface ReportParams {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  sendEmail?: boolean;
}

function getQuarterLabel(start: string, end: string): string {
  const s = new Date(start);
  const month = s.getMonth();
  const year = s.getFullYear();
  const q = Math.floor(month / 3) + 1;
  return `Q${q} ${year}`;
}

function getDefaultQuarterRange(): { startDate: string; endDate: string } {
  const now = new Date();
  // Previous quarter
  const currentQ = Math.floor(now.getMonth() / 3);
  const qStart = new Date(now.getFullYear(), (currentQ - 1) * 3, 1);
  if (currentQ === 0) {
    qStart.setFullYear(now.getFullYear() - 1);
    qStart.setMonth(9); // Q4 of previous year
  }
  const qEnd = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0);
  return {
    startDate: qStart.toISOString().split("T")[0],
    endDate: qEnd.toISOString().split("T")[0],
  };
}

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

    // Parse params — defaults to previous quarter
    let params: ReportParams;
    try {
      const body = await req.json();
      params = {
        startDate: body.startDate,
        endDate: body.endDate,
        sendEmail: body.sendEmail !== false,
      };
    } catch {
      // No body = quarterly cron trigger
      const defaults = getDefaultQuarterRange();
      params = { ...defaults, sendEmail: true };
    }

    if (!params.startDate || !params.endDate) {
      const defaults = getDefaultQuarterRange();
      params.startDate = params.startDate || defaults.startDate;
      params.endDate = params.endDate || defaults.endDate;
    }

    const { startDate, endDate } = params;
    const quarterLabel = getQuarterLabel(startDate, endDate);

    // ── Sessions ──
    const { count: sessionCount } = await supabase
      .from("sessions").select("*", { count: "exact", head: true })
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`);

    // ── AI Usage Stats ──
    const { data: usageData } = await supabase
      .from("daily_usage_stats")
      .select("call_type, call_count, stat_date")
      .gte("stat_date", startDate)
      .lte("stat_date", endDate);

    const usageTotals: Record<string, number> = {};
    const monthlyBreakdown: Record<string, Record<string, number>> = {};
    let totalAICalls = 0;

    for (const row of usageData || []) {
      usageTotals[row.call_type] = (usageTotals[row.call_type] || 0) + row.call_count;
      totalAICalls += row.call_count;

      const monthKey = row.stat_date.substring(0, 7); // YYYY-MM
      if (!monthlyBreakdown[monthKey]) monthlyBreakdown[monthKey] = {};
      monthlyBreakdown[monthKey][row.call_type] = (monthlyBreakdown[monthKey][row.call_type] || 0) + row.call_count;
    }
    const estimatedAICost = totalAICalls * ESTIMATED_COST_PER_AI_CALL;

    // ── Geo Stats ──
    const { data: geoData } = await supabase
      .from("daily_country_stats")
      .select("country_code, region, city, request_count")
      .gte("stat_date", startDate)
      .lte("stat_date", endDate)
      .order("request_count", { ascending: false });

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

    // ── Sessions by month ──
    const { data: sessionsByMonth } = await supabase
      .from("sessions")
      .select("created_at")
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`);

    const sessionMonths: Record<string, number> = {};
    for (const s of sessionsByMonth || []) {
      const m = s.created_at.substring(0, 7);
      sessionMonths[m] = (sessionMonths[m] || 0) + 1;
    }

    const result = {
      period: { start: startDate, end: endDate, label: quarterLabel },
      sessions: { total: sessionCount ?? 0, byMonth: sessionMonths },
      aiUsage: {
        totalCalls: totalAICalls,
        estimatedCost: `$${estimatedAICost.toFixed(2)}`,
        byType: usageTotals,
        byMonth: monthlyBreakdown,
      },
      geo: { totalRequests: totalGeoRequests, byCountry: countryTotals, topLocations: locationDetails.slice(0, 20) },
    };

    // ── Send email ──
    if (!params.sendEmail) {
      return new Response(JSON.stringify({ success: true, emailSent: false, report: result }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Monthly breakdown rows
    const sortedMonths = Object.keys(monthlyBreakdown).sort();
    const monthlyRows = sortedMonths.map((month) => {
      const types = monthlyBreakdown[month];
      const monthCalls = Object.values(types).reduce((s, c) => s + c, 0);
      const monthCost = monthCalls * ESTIMATED_COST_PER_AI_CALL;
      const sessions = sessionMonths[month] || 0;
      return `<tr>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; font-weight: bold;">${month}</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">${sessions}</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">${monthCalls}</td>
        <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">~$${monthCost.toFixed(2)}</td>
      </tr>`;
    }).join("");

    // Usage type breakdown rows
    const usageRows = Object.entries(usageTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => `<tr>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6;">${type}</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">${count}</td>
        <td style="padding: 6px 12px; border: 1px solid #dee2e6; text-align: right;">~$${(count * ESTIMATED_COST_PER_AI_CALL).toFixed(3)}</td>
      </tr>`).join("") || `<tr><td colspan="3" style="padding: 8px; color: #999; text-align: center;">No AI usage data</td></tr>`;

    // Geo rows (top 15)
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
      : `<tr><td colspan="3" style="padding: 8px; color: #999; text-align: center;">No geo data</td></tr>`;

    const now = new Date();

    await resend.emails.send({
      from: "HeyGetOnMyLevel <onboarding@resend.dev>",
      to: [ALERT_EMAIL],
      subject: `📊 ${quarterLabel} Cost Report — HeyGetOnMyLevel (~$${estimatedAICost.toFixed(2)} total)`,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">📊 ${quarterLabel} Cumulative Cost Report</h2>
          <p style="color: #666;">Period: ${startDate} → ${endDate}</p>
          
          <div style="background: #e8f4fd; padding: 16px; border-radius: 8px; border-left: 4px solid #3498db; margin: 16px 0;">
            <p style="margin: 4px 0; font-size: 18px;"><strong>${sessionCount ?? 0}</strong> total sessions</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>${totalAICalls}</strong> AI calls</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>~$${estimatedAICost.toFixed(2)}</strong> estimated AI cost</p>
          </div>

          <h3 style="color: #333;">📅 Monthly Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px 12px; text-align: left;">Month</th>
              <th style="padding: 8px 12px; text-align: right;">Sessions</th>
              <th style="padding: 8px 12px; text-align: right;">AI Calls</th>
              <th style="padding: 8px 12px; text-align: right;">Est. Cost</th>
            </tr>
            ${monthlyRows || `<tr><td colspan="4" style="padding: 8px; color: #999; text-align: center;">No data for this period</td></tr>`}
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td style="padding: 8px 12px; border: 1px solid #dee2e6;">TOTAL</td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">${sessionCount ?? 0}</td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">${totalAICalls}</td>
              <td style="padding: 8px 12px; border: 1px solid #dee2e6; text-align: right;">~$${estimatedAICost.toFixed(2)}</td>
            </tr>
          </table>

          <h3 style="color: #333;">🤖 AI Usage by Type</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px 12px; text-align: left;">Call Type</th>
              <th style="padding: 8px 12px; text-align: right;">Count</th>
              <th style="padding: 8px 12px; text-align: right;">Est. Cost</th>
            </tr>
            ${usageRows}
          </table>
          <p style="color: #999; font-size: 11px;">Estimates based on ~$${ESTIMATED_COST_PER_AI_CALL}/call. Actual costs may vary.</p>

          <h3 style="color: #333;">🌍 Traffic by Location</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr style="background: #333; color: #fff;">
              <th style="padding: 8px 12px; text-align: left;">Location</th>
              <th style="padding: 8px 12px; text-align: right;">Requests</th>
              <th style="padding: 8px 12px; text-align: right;">Share</th>
            </tr>
            ${locationRows}
          </table>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 11px;">
            Generated: ${now.toISOString()}<br/>
            Schedule: Quarterly (1st of Jan/Apr/Jul/Oct)<br/>
            On-demand: POST to /functions/v1/cost-report with {"startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD"}
          </p>
        </div>
      `,
    });

    console.log(`Cost report sent for ${quarterLabel}`);

    return new Response(JSON.stringify({ success: true, emailSent: true, report: result }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in cost-report:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
