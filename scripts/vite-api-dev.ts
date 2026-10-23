import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";

/** Routes served from api/ in dev, exactly as Vercel serves them in production. /api/contact still goes to backend/. */
const ROUTES: Record<string, string> = {
  "/api/updates": "api/updates.js",
  "/api/recommendations": "api/recommendations.js",
  "/api/comments": "api/comments.js",
  "/api/admin/moderation": "api/admin/moderation.js",
  "/api/admin/session": "api/admin/session.js",
  "/api/admin/login": "api/admin/login.js",
  "/api/admin/logout": "api/admin/logout.js",
  "/api/admin/updates": "api/admin/updates.js",
  "/api/admin/upload": "api/admin/upload.js",
};

/** Loads KEY=value lines into process.env without overriding anything already set. */
const loadEnvFile = (file: string) => {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[match[1]] === undefined && value !== "") process.env[match[1]] = value;
  }
};

const readJson = (req: IncomingMessage) =>
  new Promise<unknown>((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
  });

/**
 * Dev only: runs the Vercel functions in api/ inside the Vite dev server, with the small subset of Vercel's
 * request/response helpers they use (req.query, req.body, res.status().json()).
 */
export const apiDevServer = (root: string): Plugin => ({
  name: "api-dev-server",
  apply: "serve",
  configureServer(server) {
    loadEnvFile(path.join(root, ".env.local"));
    loadEnvFile(path.join(root, ".env"));
    loadEnvFile(path.join(root, "backend", ".env"));

    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const file = ROUTES[url.pathname];
      if (!file) return next();

      const vreq = req as IncomingMessage & { query: Record<string, string>; body?: unknown };
      vreq.query = Object.fromEntries(url.searchParams);
      // JSON bodies are parsed like Vercel does; anything else (photo uploads) is left as a stream for the handler.
      if ((req.headers["content-type"] ?? "").startsWith("application/json")) vreq.body = await readJson(req);

      const vres = res as ServerResponse & {
        status: (code: number) => typeof vres;
        json: (payload: unknown) => void;
      };
      vres.status = (code) => {
        res.statusCode = code;
        return vres;
      };
      vres.json = (payload) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(payload));
      };

      try {
        const abs = path.join(root, file);
        // Cache-bust on change so edits to a handler apply without restarting the dev server.
        const mod = await import(`${pathToFileURL(abs).href}?t=${statSync(abs).mtimeMs}`);
        await mod.default(vreq, vres);
      } catch (error) {
        server.config.logger.error(`[api] ${url.pathname} failed: ${error instanceof Error ? error.stack : error}`);
        if (!res.headersSent) vres.status(500).json({ error: "Dev API error, see the terminal." });
      }
    });
  },
});
