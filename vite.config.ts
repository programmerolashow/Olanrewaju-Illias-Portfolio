import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync } from "fs";
import { site, staticRoutes } from "./src/config/site";
import { projects } from "./src/data/projects";
import { apiDevServer } from "./scripts/vite-api-dev";

const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Fills the %SITE_*% tokens in index.html from src/config/site.ts, adds the Umami script when a website
 * ID is set, and writes sitemap.xml and robots.txt into the build.
 */
const sitePlugin = (): Plugin => ({
  name: "site-meta",
  transformIndexHtml: {
    // Run before Vite's own %ENV% replacement so it never sees these tokens.
    order: "pre",
    handler(html) {
      const filled = html
        .replace(/%SITE_URL%/g, site.url)
        .replace(/%SITE_TITLE%/g, escapeAttr(site.title))
        .replace(/%SITE_DESCRIPTION%/g, escapeAttr(site.description))
        .replace(/%SITE_NAME%/g, escapeAttr(site.name))
        .replace(/%SITE_TWITTER%/g, escapeAttr(site.twitter));
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
