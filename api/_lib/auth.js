// Single-owner admin auth: one password (ADMIN_PASSWORD) and a signed, HttpOnly session cookie (SESSION_SECRET).
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return value;
};

const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEqual = (a, b) => {
  // Hash first so inputs of different lengths still compare in constant time.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export const passwordMatches = (candidate) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) throw new Error("ADMIN_PASSWORD must be set to at least 12 characters.");
  return typeof candidate === "string" && safeEqual(candidate, expected);
};

const readCookie = (req, name) => {
  const header = req.headers.cookie ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
};

export const isAuthenticated = (req) => {
  const token = readCookie(req, COOKIE);
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Date.now() / 1000;
};

export const setSessionCookie = (res) => {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${expires}.${sign(expires)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`,
  );
};

export const clearSessionCookie = (res) => {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
};

/** Rejects cross-site writes: the browser's Origin must match the host serving the API. */
export const sameOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin GETs and some same-origin POSTs omit it; SameSite=Strict still applies
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
};

export const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim() || "unknown";
};

export const readBody = (req) => {
  if (typeof req.body !== "string") return req.body ?? null;
  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
};

/** Returns true when the request may continue; otherwise it has already sent 401/403. */
export const requireAdmin = (req, res) => {
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "Cross-site request blocked." });
    return false;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Not signed in." });
    return false;
  }
  return true;
};
