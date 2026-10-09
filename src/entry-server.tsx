// Build-time only: renders public routes to static HTML so crawlers and no-JS
// readers see real text. Used by the prerender plugin in vite.config.ts.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import type { ReactNode } from "react";
import App from "./App";
import { gradeBands } from "./data/curriculum";

// Public, indexable pages only. /select-level and /assessment need a session and
// send a fresh visitor back to "/", so they are not prerendered or listed.
export const PRERENDER_ROUTES = [
  "/",
  "/curriculum",
  ...gradeBands.map((gb) => `/curriculum/${gb.slug}`),
  "/install",
  "/privacy",
  "/terms",
];

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const Router = ({ children }: { children: ReactNode }) => <StaticRouter location={url}>{children}</StaticRouter>;
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <App Router={Router} />
    </HelmetProvider>,
  );
  const h = helmetContext.helmet;
  const head = h ? [h.title.toString(), h.meta.toString(), h.link.toString()].join("\n    ") : "";
  return { html, head };
}
