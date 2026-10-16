/**
 * Contact form → email.
 *
 * Shared by:
 *   - api/contact.js       (Vercel serverless function, used in production on Vercel)
 *   - backend/server.js    (Express server, used for local development or any Node host)
 *
 * Required environment variables (set them in backend/.env locally, and in your host's dashboard in production):
 *   EMAIL_USER   the Gmail address that sends the notification (e.g. you@gmail.com)
 *   EMAIL_PASS   a Gmail *App Password* for that account (not your normal password)
 * Optional:
 *   CONTACT_TO   where messages are delivered (defaults to EMAIL_USER)
 */
import nodemailer from "nodemailer";

const LIMITS = { name: 100, email: 254, subject: 150, message: 5000, minMessage: 10 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Submissions faster than this after the form loaded are almost certainly bots
const MIN_FILL_MS = 2500;

// Best-effort in-memory rate limit: 5 messages per IP per 10 minutes.
// (On serverless hosts each instance has its own memory, so this throttles bursts rather than being a hard cap.)
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

const isRateLimited = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Strips line breaks so user input can never inject extra email headers
const singleLine = (value) => value.replace(/[\r\n]+/g, " ").trim();

let transporter;
const getTransporter = () => {
  if (!transporter) {
    // Port 587 + STARTTLS: many networks block port 465 (the "gmail" service default), but allow 587.
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      connectionTimeout: 15000,
    });
  }
  return transporter;
};

const validate = (body) => {
  const errors = {};
  const str = (v) => (typeof v === "string" ? v : "");
  const data = {
    name: singleLine(str(body.name)),
    email: singleLine(str(body.email)).toLowerCase(),
    subject: singleLine(str(body.subject)),
    message: str(body.message).trim(),
  };

  if (data.name.length < 2) errors.name = "Please enter your name.";
  else if (data.name.length > LIMITS.name) errors.name = `Name must be under ${LIMITS.name} characters.`;

  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) errors.email = "Please enter a valid email address.";

  if (data.subject.length < 2) errors.subject = "Please add a subject.";
  else if (data.subject.length > LIMITS.subject) errors.subject = `Subject must be under ${LIMITS.subject} characters.`;

  if (data.message.length < LIMITS.minMessage) errors.message = `Message must be at least ${LIMITS.minMessage} characters.`;
  else if (data.message.length > LIMITS.message) errors.message = `Message must be under ${LIMITS.message} characters.`;

  return { data, errors };
};

const buildEmail = ({ name, email, subject, message }) => {
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, "<br>"),
  };
  const receivedAt = new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });

  const text = [
    `New message from your portfolio`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    `Received: ${receivedAt} (Lagos)`,
    ``,
    message,
    ``,
    `Reply to this email to respond directly to ${name}.`,
  ].join("\n");

  const html = `
  <div style="background:#f4f6fb;padding:24px 12px;font-family:Segoe UI,Arial,sans-serif;color:#0f172a">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:linear-gradient(135deg,#0891b2,#9333ea);padding:20px 24px;color:#ffffff">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85">Portfolio contact</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px">${safe.subject}</div>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748b;width:90px">From</td><td style="padding:6px 0;font-weight:600">${safe.name}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0"><a href="mailto:${safe.email}" style="color:#0891b2">${safe.email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Received</td><td style="padding:6px 0">${receivedAt} (Lagos)</td></tr>
        </table>
        <div style="margin-top:18px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;font-size:15px;line-height:1.6">${safe.message}</div>
        <p style="margin-top:20px;font-size:13px;color:#64748b">Hit <strong>Reply</strong> to respond directly to ${safe.name}.</p>
      </div>
    </div>
  </div>`;

  return { text, html };
};

/**
 * Framework-agnostic handler.
 * @param {object} body  parsed JSON body
 * @param {string} ip    client IP (for rate limiting)
 * @returns {Promise<{status:number, json:object}>}
 */
export async function handleContact(body, ip = "unknown") {
  if (!body || typeof body !== "object") {
    return { status: 400, json: { error: "Invalid request." } };
  }

  // Spam traps: hidden "website" field must stay empty, and humans take a few seconds to fill the form.
  // Bots get a fake success so they don't retry.
  const startedAt = Number(body.startedAt);
  if (body.website || (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS)) {
    return { status: 200, json: { success: true } };
  }

  if (isRateLimited(ip)) {
    return { status: 429, json: { error: "Too many messages. Please try again in a few minutes." } };
  }

  const { data, errors } = validate(body);
  if (Object.keys(errors).length > 0) {
    return { status: 400, json: { error: "Please fix the highlighted fields.", fields: errors } };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[contact] EMAIL_USER / EMAIL_PASS are not configured.");
    return { status: 500, json: { error: "Email service is not configured." } };
  }

  const { text, html } = buildEmail(data);

  try {
    await getTransporter().sendMail({
      // Sent *from* your own account (so Gmail/SPF accept it); replies go straight to the visitor.
      from: { name: `${data.name} via Portfolio`, address: process.env.EMAIL_USER },
      to: process.env.CONTACT_TO || process.env.EMAIL_USER,
      replyTo: { name: data.name, address: data.email },
      subject: `Portfolio: ${data.subject}`,
      text,
      html,
    });
    return { status: 200, json: { success: true } };
  } catch (error) {
    console.error("[contact] Failed to send email:", error);
    return { status: 502, json: { error: "Couldn't send your message right now. Please try again or email me directly." } };
  }
}
