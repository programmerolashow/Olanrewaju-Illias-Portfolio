// Public: email sign-up for Updates (double opt-in).
//   POST /api/subscribe                              { email, website, startedAt } → sends a confirmation email
//   GET  /api/subscribe?action=confirm&token=...     link in that email → confirmed, back to /updates
//   GET  /api/subscribe?action=unsubscribe&token=... link in every update email → unsubscribed, back to /updates
//   POST /api/subscribe?action=unsubscribe&token=... one-click unsubscribe from mail apps (RFC 8058)
// The response to a sign-up never says whether the address was already on the list.
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { sql } from "./_lib/db.js";
import { guestBody, ipHash, overLimit } from "./_lib/guest.js";
import { emailHtml, mailConfigured, sendMail } from "./_lib/mail.js";

const TOKEN = /^[A-Za-z0-9_-]{32,100}$/;
const email = z.string().trim().toLowerCase().max(200).email();
/** Don't send another confirmation to the same address sooner than this. */
const RESEND_AFTER_MINUTES = 10;

const origin = (req) => `${req.headers["x-forwarded-proto"] ?? "https"}://${req.headers.host}`;

const redirect = (res, to) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", to);
  return res.status(302).end();
};

const sendConfirmation = (req, address, token) => {
  const link = `${origin(req)}/api/subscribe?action=confirm&token=${token}`;
  return sendMail({
    to: address,
    subject: "Confirm your subscription to Olanrewaju Illias' updates",
    text: `Please confirm you'd like to get an email when I post a new event or update:\n\n${link}\n\nIf you didn't sign up, ignore this email and you won't hear from me.`,
    html: emailHtml({
      heading: "Confirm your subscription",
      paragraphs: ["Please confirm you'd like to get an email when I post a new event or update on my portfolio."],
      button: { href: link, label: "Confirm subscription" },
      footer: "If you didn't sign up, ignore this email and you won't hear from me.",
    }),
  });
};

const signUp = async (req, res) => {
  const body = guestBody(req, res);
  if (!body) return;
  const parsed = email.safeParse(body.email);
  if (!parsed.success) return res.status(400).json({ error: "Enter a valid email address." });
  const address = parsed.data;
  if (!mailConfigured()) {
    console.error("[subscribe] EMAIL_USER / EMAIL_PASS are not configured.");
    return res.status(503).json({ error: "Email sign-up isn't available right now." });
  }

  const hash = ipHash(req);
  if (await overLimit("subscribers", hash, 5, 1)) {
    return res.status(429).json({ error: "Too many sign-ups from your connection. Please try again later." });
  }

  const ok = () => res.status(200).json({ ok: true });
  const [existing] = await sql`
    select id, status, token, confirm_sent_at > now() - ${`${RESEND_AFTER_MINUTES} minutes`}::interval as recent
    from subscribers where lower(email) = ${address}`;

  if (existing?.status === "confirmed") return ok();
  if (existing?.recent) return ok();

  let token;
  if (existing) {
    // Re-subscribing after unsubscribing goes back through confirmation.
    token = existing.token;
    await sql`
      update subscribers set status = 'pending', confirm_sent_at = now(), ip_hash = ${hash}, unsubscribed_at = null
      where id = ${existing.id}`;
  } else {
    token = randomBytes(24).toString("base64url");
    await sql`insert into subscribers (email, token, ip_hash) values (${address}, ${token}, ${hash}) on conflict do nothing`;
  }

  await sendConfirmation(req, address, token);
  return ok();
};

export default async function handler(req, res) {
  const action = typeof req.query.action === "string" ? req.query.action : "";
  const token = typeof req.query.token === "string" ? req.query.token : "";

  try {
    if (action === "confirm" && req.method === "GET") {
      if (!TOKEN.test(token)) return redirect(res, "/updates?subscription=invalid");
      const rows = await sql`
        update subscribers set status = 'confirmed', confirmed_at = coalesce(confirmed_at, now())
        where token = ${token} and status in ('pending', 'confirmed')
        returning id`;
      return redirect(res, rows.length ? "/updates?subscription=confirmed" : "/updates?subscription=invalid");
    }

    if (action === "unsubscribe" && (req.method === "GET" || req.method === "POST")) {
      // The token is the only credential needed: it's in the link only the subscriber received.
      if (TOKEN.test(token)) {
        await sql`
          update subscribers set status = 'unsubscribed', unsubscribed_at = now()
          where token = ${token} and status <> 'unsubscribed'`;
      }
      if (req.method === "POST") {
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ ok: true });
      }
      return redirect(res, "/updates?subscription=unsubscribed");
    }

    if (!action && req.method === "POST") return await signUp(req, res);

    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/subscribe failed`, error);
    if (req.method === "GET") return redirect(res, "/updates?subscription=error");
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
