/**
 * Link-preview images that show the real page: screenshots every fixed page and project page at 1200x630 into
 * public/og/screens/<name>.jpg (pages by key, e.g. roadmap.jpg; projects by slug). vite.config.ts uses them as
 * og:image, falling back to public/og/projects/<slug>.jpg and then og-image.jpg.
 *
 *   npm run og:screens                                  every page, from the live site (site.url)
 *   npm run og:screens -- --only chekueit,betalife      just these pages/projects
 *   npm run og:screens -- --base http://localhost:4173  from another host (e.g. `npx vite preview` before deploying)
 *   npm run og:screens -- --only moments --settle 12000 wait longer before the shot (photo-heavy pages)
 *
 * Needs Google Chrome or Microsoft Edge. Re-run after a page changes and redeploy so the images follow.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/config/site.ts";
import { pageRoutes } from "../src/config/pages.ts";
import { projects } from "../src/data/projects.ts";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "public", "og", "screens");
const W = 1200;
const H = 630;
const PORT = 9333;

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const base = (arg("base") ?? site.url).replace(/\/$/, "");
const only = arg("only")?.split(",").map((s) => s.trim());
// Time for fonts, images and entrance animations to settle before the shot (raise for photo-heavy pages).
const SETTLE_MS = Number(arg("settle") ?? 4500);

const targets = [
  ...Object.entries(pageRoutes).map(([key, route]) => ({ name: key, route })),
  ...projects.map((p) => ({ name: p.slug, route: `/projects/${p.slug}` })),
].filter((t) => !only || only.includes(t.name));

const browsers = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];
const browser = browsers.find((b) => existsSync(b));
if (!browser) throw new Error("Chrome or Edge not found.");

const profile = mkdtempSync(path.join(tmpdir(), "og-screens-"));
const chrome = spawn(browser, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--window-size=${W},${H}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const connect = async () => {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(200);
  }
  throw new Error("Could not connect to the browser.");
};

const ws = new WebSocket(await connect());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let nextId = 0;
const pending = new Map();
const waiters = [];
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    for (const w of waiters.filter((w) => w.method === msg.method)) {
      waiters.splice(waiters.indexOf(w), 1);
      w.resolve(msg.params);
    }
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const once = (method, timeout = 30000) =>
  Promise.race([
    new Promise((resolve) => waiters.push({ method, resolve })),
    sleep(timeout).then(() => {
      throw new Error(`Timed out waiting for ${method}`);
    }),
  ]);

try {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  // Skip the zip intro and the site tour, as a returning visitor would see the page.
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { sessionStorage.setItem("zipper-opened", "1"); localStorage.setItem("site-tour-done", "1"); } catch {}`,
  });

  mkdirSync(OUT, { recursive: true });
  for (const t of targets) {
    const url = `${base}${t.route}`;
    const loaded = once("Page.loadEventFired");
    await send("Page.navigate", { url });
    await loaded;
    await sleep(SETTLE_MS);
    const { data } = await send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 82,
      clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
    });
    const file = path.join(OUT, `${t.name}.jpg`);
    writeFileSync(file, Buffer.from(data, "base64"));
    console.log(`${path.relative(ROOT, file)}  ${Math.round(data.length * 0.75 / 1024)} KB  ← ${url}`);
  }
} finally {
  ws.close();
  chrome.kill();
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* browser still releasing files */
  }
}
