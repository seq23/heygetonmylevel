import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Eye, Loader2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
  period: { start: string; end: string; label: string };
  sessions: { total: number; byMonth: Record<string, number> };
  aiUsage: {
    totalCalls: number;
    estimatedCost: string;
    byType: Record<string, number>;
    byMonth: Record<string, Record<string, number>>;
  };
  geo: {
    totalRequests: number;
    byCountry: Record<string, number>;
    topLocations: { location: string; count: number }[];
  };
}

const Admin = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { toast } = useToast();

  const handleRequest = async (sendEmail: boolean) => {
    setLoading(true);
    setReportData(null);
    try {
      const { data, error } = await supabase.functions.invoke("cost-report", {
        body: {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          sendEmail,
        },
      });
      if (error) throw error;
      if (data?.report) setReportData(data.report);
      toast({
        title: sendEmail ? "Report emailed ✓" : "Report loaded ✓",
        description: sendEmail
          ? "Check your inbox for the full report."
          : `${data?.report?.sessions?.total ?? 0} sessions, ${data?.report?.aiUsage?.totalCalls ?? 0} AI calls.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6" /> Operator Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Cost & traffic reporting — not visible to users</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Generate Report</CardTitle>
          <CardDescription>Select a date range and choose how to receive the report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => d && setStartDate(d)}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => d && setEndDate(d)}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => handleRequest(false)} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
              View Data
            </Button>
            <Button variant="secondary" onClick={() => handleRequest(true)} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Email Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-foreground">{reportData.sessions.total}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-foreground">{reportData.aiUsage.totalCalls}</p>
                <p className="text-sm text-muted-foreground">AI Calls</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-foreground">{reportData.aiUsage.estimatedCost}</p>
                <p className="text-sm text-muted-foreground">Est. AI Cost</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          {Object.keys(reportData.sessions.byMonth).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Sessions by Month</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.sessions.byMonth).sort().map(([month, count]) => (
                    <div key={month} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{month}</span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Usage by Type */}
          {Object.keys(reportData.aiUsage.byType).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">AI Usage by Type</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(reportData.aiUsage.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{type}</span>
                      <span className="font-medium text-foreground">{count} (~${(count * 0.003).toFixed(3)})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Locations */}
          {reportData.geo.topLocations.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Top Locations</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.geo.topLocations.map((loc, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{loc.location}</span>
                      <span className="font-medium text-foreground">{loc.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
