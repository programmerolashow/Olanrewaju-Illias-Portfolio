// Shared checks for public submissions (recommendations and comments). Nothing here trusts the browser.
import { createHmac } from "node:crypto";
import { sql } from "./db.js";
import { clientIp, readBody, sameOrigin } from "./auth.js";

/** Forms are rendered with a timestamp; anything posted back faster than this was not typed by a person. */
const MIN_FILL_MS = 3000;

/** Salted so the stored value can't be reversed into an IP by anyone holding the database. */
export const ipHash = (req) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return createHmac("sha256", secret).update(clientIp(req)).digest("base64url");
};

/**
 * Common gate for guest POSTs. Returns the parsed body when the request may continue; otherwise it has already
 * responded. Bots that fill the hidden "website" field or post instantly get a fake success so they don't retry.
 */
export const guestBody = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "Cross-site request blocked." });
    return null;
  }
  const body = readBody(req);
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid request." });
    return null;
  }
  const startedAt = Number(body.startedAt);
  if (body.website || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    res.status(201).json({ ok: true });
    return null;
  }
  return body;
};

/** True when this visitor has already sent `max` rows to `table` within the window. */
export const overLimit = async (table, hash, max, hours) => {
  const window = `${hours} hours`;
  const [{ count }] =
    table === "recommendations"
      ? await sql`select count(*)::int as count from recommendations where ip_hash = ${hash} and created_at > now() - ${window}::interval`
      : await sql`select count(*)::int as count from update_comments where ip_hash = ${hash} and created_at > now() - ${window}::interval`;
  return count >= max;
};
