// Vercel serverless function: POST /api/contact
// Set EMAIL_USER and EMAIL_PASS in Vercel → Project → Settings → Environment Variables.
import { handleContact } from "../backend/contact.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim() || "unknown";

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const { status, json } = await handleContact(body, ip);
  return res.status(status).json(json);
}
