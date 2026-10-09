import { defineConfig, build, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import { componentTagger } from "lovable-tagger";

const SITE_URL = "https://heygetonmylevel.com";

/** Head tags the per-route Helmet output replaces in the prerendered HTML. */
const ROUTE_HEAD_TAGS = [
  /<title>[\s\S]*?<\/title>\s*/,
  /<meta name="description"[^>]*>\s*/,
  /<meta property="og:(title|description|url|type|image)"[^>]*>\s*/g,
  /<meta name="twitter:(card|title|description|image)"[^>]*>\s*/g,
];

/**
 * After the client build, server-render every public route (src/entry-server.tsx)
 * into dist/<route>/index.html and dist/<route>.html, and regenerate sitemap.xml
 * from the same route list, so crawlers and no-JS readers get real text.
 * The browser still mounts with createRoot, which replaces the static markup.
 */
function prerender(): Plugin {
  let outDir = "dist";
  let root = process.cwd();
  return {
    name: "hgoml-prerender",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      root = config.root;
    },
    async closeBundle() {
      if (process.env.HGOML_SSR_BUILD) return;
      const ssrOut = path.resolve(root, "node_modules/.hgoml-ssr");
      process.env.HGOML_SSR_BUILD = "1";
      try {
        await build({
          root,
          logLevel: "warn",
          // Bundle every dependency: several are CommonJS and cannot be imported by name from Node ESM.
          ssr: { noExternal: true },
          configFile: path.resolve(root, "vite.config.ts"),
          build: { ssr: "src/entry-server.tsx", outDir: ssrOut, emptyOutDir: true, copyPublicDir: false },
        });
      } finally {
        delete process.env.HGOML_SSR_BUILD;
      }
      // Browser globals some modules touch at import time (Supabase auth storage).
      const store = new Map<string, string>();
      // Assigned unconditionally: Node 22+ exposes a localStorage global that is unusable without a file.
      Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, String(v)),
        removeItem: (k: string) => void store.delete(k),
        clear: () => store.clear(),
        key: (i: number) => [...store.keys()][i] ?? null,
        get length() { return store.size; },
      } });
      const entry = fs.readdirSync(ssrOut).find((f) => /^entry-server\.(m?js)$/.test(f));
      if (!entry) throw new Error("prerender: SSR entry was not built");
      const mod = await import(pathToFileURL(path.join(ssrOut, entry)).href);
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const routes: string[] = mod.PRERENDER_ROUTES;
      if (!routes?.length) throw new Error("prerender: no routes");
      for (const route of routes) {
        const { html, head } = mod.render(route);
        if (!html || html.length < 200) throw new Error(`prerender: ${route} rendered empty`);
        let page = template;
        for (const re of ROUTE_HEAD_TAGS) page = page.replace(re, "");
        page = page
          .replace("</head>", `    ${head}\n  </head>`)
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
        if (route === "/") {
          fs.writeFileSync(path.join(outDir, "index.html"), page);
        } else {
          const rel = route.replace(/^\//, "");
          fs.mkdirSync(path.join(outDir, rel), { recursive: true });
          fs.writeFileSync(path.join(outDir, rel, "index.html"), page);
          fs.writeFileSync(path.join(outDir, `${rel}.html`), page);
        }
      }
      const today = new Date().toISOString().slice(0, 10);
      const urls = routes
        .map((r) => {
          const priority = r === "/" ? "1.0" : r.startsWith("/curriculum") ? "0.8" : r === "/privacy" || r === "/terms" ? "0.3" : "0.7";
          return `  <url>\n    <loc>${SITE_URL}${r}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
        })
        .join("\n");
      fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      fs.rmSync(ssrOut, { recursive: true, force: true });
      console.log(`prerender: ${routes.length} routes written, sitemap updated`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), !process.env.HGOML_SSR_BUILD && prerender()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
