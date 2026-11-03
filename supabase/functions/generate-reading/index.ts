import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { makeHandler } from "./handler.ts";

const url = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const sb = url && serviceKey ? createClient(url, serviceKey) : null;

serve(makeHandler({
  env: (k) => Deno.env.get(k),
  db: sb,
  getUserId: async (jwt) => (sb ? (await sb.auth.getUser(jwt)).data.user?.id ?? null : null),
  fetch,
  rpcQuiet: (fn, args) => { sb?.rpc(fn, args).then(() => {}, () => {}); },
  insertCachedPassage: async (row) => sb ? await sb.from("cached_passages").insert(row) : { error: { message: "no service-role client" } },
}));
