import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { makeHandler } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const sb = url && serviceKey ? createClient(url, serviceKey) : null;
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(makeHandler({
  env: (k) => Deno.env.get(k),
  db: sb,
  getUserId: async (jwt) => (sb ? (await sb.auth.getUser(jwt)).data.user?.id ?? null : null),
  sendEmail: async (msg) => {
    const r = await resend.emails.send(msg);
    if ((r as { error?: unknown }).error) throw new Error(JSON.stringify((r as { error?: unknown }).error));
    return r;
  },
}));
