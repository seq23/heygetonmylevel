import { Sparkles } from "lucide-react";

/** Cross-link: HeyGetOnMyLevel is not sold on its own; it comes free with Time2Read Premium. */
const Time2ReadCallout = () => (
  <aside
    aria-label="Included with Time2Read Premium"
    className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-left max-w-md mx-auto"
  >
    <p className="flex items-center gap-2 font-semibold text-foreground">
      <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
      Included free with Time2Read Premium
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      HeyGetOnMyLevel is the reading-level companion to Time2Read, personalized interactive reading
      adventures for kids. Time2Read Premium members get it at no extra cost.
    </p>
    <a
      href="https://time-2-read.com"
      target="_blank"
      rel="noopener"
      className="inline-block mt-3 text-sm font-semibold text-primary underline underline-offset-2 hover:opacity-80"
    >
      Visit Time2Read →
    </a>
  </aside>
);

export default Time2ReadCallout;
