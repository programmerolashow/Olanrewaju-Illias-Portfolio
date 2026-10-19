import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { site, staticRoutes } from "./src/config/site";
import { pageMeta, pageRoutes } from "./src/config/pages";
import { projects } from "./src/data/projects";
import { excerpt, replaceSeo, type SeoMeta } from "./api/_lib/seo.js";
import { apiDevServer } from "./scripts/vite-api-dev";

const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Home-page link preview; also the fallback for any page without its own image. */
const defaultSeo = (): SeoMeta => ({
  siteName: site.name,
  twitter: site.twitter,
  title: site.title,
  description: site.description,
  url: `${site.url}/`,
  image: `${site.url}/og-image.jpg`,
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: `${site.name}, Full-Stack Product Engineer`,
});

/**
 * Fills index.html from src/config/site.ts (tokens + the home page's link-preview tags), adds the Umami script
 * when a website ID is set, writes sitemap.xml and robots.txt, and writes a copy of index.html for every fixed
 * page and project with that page's own title, description and preview image. Vercel serves those files
 * directly (cleanUrls in vercel.json), so LinkedIn, X, Facebook and WhatsApp (which don't run JavaScript) see the right preview.
 */
const sitePlugin = (): Plugin => ({
  name: "site-meta",
  transformIndexHtml: {
    // Run before Vite's own %ENV% replacement so it never sees the %SITE_NAME% token.
    order: "pre",
    handler(html) {
      const filled = replaceSeo(html, defaultSeo()).replace(/%SITE_NAME%/g, escapeAttr(site.name));
      if (!site.umamiWebsiteId) return filled;
      return {
        html: filled,
        tags: [
          {
            tag: "script",
            attrs: { defer: true, src: "https://cloud.umami.is/script.js", "data-website-id": site.umamiWebsiteId },
            injectTo: "head",
          },
        ],
      };
    },
  },
  generateBundle() {
    if (site.url.includes("REPLACE")) {
      this.warn("site.url in src/config/site.ts is still a placeholder: link previews and the sitemap will point nowhere.");
    }
    const routes = [...staticRoutes, ...projects.map((p) => `/projects/${p.slug}`)];
    const urls = routes.map((r) => `  <url><loc>${site.url}${r === "/" ? "/" : r}</loc></url>`).join("\n");
    this.emitFile({
      type: "asset",
      fileName: "sitemap.xml",
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    });
    this.emitFile({
      type: "asset",
      fileName: "robots.txt",
      source: `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site.url}/sitemap.xml\n`,
    });
  },
  writeBundle(options) {
    const outDir = options.dir ?? path.resolve(__dirname, "dist");
    const template = readFileSync(path.join(outDir, "index.html"), "utf8");
    const base = defaultSeo();
    // Written as /services.html, /projects/bankspace.html, …; vercel.json's cleanUrls serves them at /services etc.
    const write = (route: string, meta: Partial<SeoMeta>) => {
      const file = path.join(outDir, `${route}.html`);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, replaceSeo(template, { ...base, url: `${site.url}${route}`, ...meta }));
    };

    for (const [key, route] of Object.entries(pageRoutes) as [keyof typeof pageMeta, string][]) {
      const { title, description } = pageMeta[key];
      write(route, { title: `${title} | ${site.name}`, description });
    }
    for (const p of projects) {
      const card = `/og/projects/${p.slug}.jpg`;
      const hasCard = existsSync(path.join(__dirname, "public", card));
      if (!hasCard) this.warn(`No preview card for project "${p.slug}"; using og-image.jpg. Run npm run og:cards.`);
      write(`/projects/${p.slug}`, {
        title: `${p.title} | ${site.name}`,
        description: excerpt(p.description),
        type: "article",
        ...(hasCard ? { image: `${site.url}${card}`, imageAlt: `${p.title}: ${p.tags.slice(0, 4).join(", ")}` } : {}),
      });
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // In development, /api/updates and /api/admin/* run from api/ (see scripts/vite-api-dev.ts); the rest of
    // /api/* (the contact form) goes to the Express server in /backend (run: cd backend && npm run dev).
    // In production on Vercel, everything under /api is served from api/.
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  define: {
    __HAS_CV__: JSON.stringify(existsSync(path.resolve(__dirname, "public", site.cvPath.replace(/^\//, "")))),
  },
  plugins: [react(), sitePlugin(), apiDevServer(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // The single vendor chunk below is ~530 kB (~170 kB gzipped); that's expected.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // One long-lived vendor chunk: it changes rarely, so returning visitors keep it cached.
        // Keep it as ONE chunk. Splitting React from libraries that use it (e.g. separate "react" and "vendor"
        // chunks) created a circular import that ran a library before React existed and blanked the whole site.
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
}));
