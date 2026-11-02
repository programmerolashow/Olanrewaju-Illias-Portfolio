// Admin only: Updates email list.
//   GET  /api/admin/subscribers                       counts by status (addresses are never sent to the browser)
//   POST /api/admin/subscribers?updateId=...          email that published post to every confirmed subscriber
//   POST /api/admin/subscribers?updateId=...&again=1  send it again although it was already emailed
// Each subscriber gets their own email (with their own unsubscribe link), sent one after another.
import { sql } from "../_lib/db.js";
import { requireAdmin } from "../_lib/auth.js";
import { excerpt } from "../_lib/seo.js";
import { emailHtml, escapeHtml, mailConfigured, sendMail } from "../_lib/mail.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Gmail's daily limit for a personal account is about 500 recipients; stay under it in one send. */
const MAX_PER_SEND = 450;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      const rows = await sql`select status, count(*)::int as count from subscribers group by status`;
      const counts = { pending: 0, confirmed: 0, unsubscribed: 0 };
      for (const r of rows) counts[r.status] = r.count;
      return res.status(200).json({ counts });
    }

    if (req.method === "POST") {
      const updateId = typeof req.query.updateId === "string" ? req.query.updateId : "";
      if (!UUID.test(updateId)) return res.status(400).json({ error: "A valid updateId is required." });
      if (!mailConfigured()) return res.status(503).json({ error: "EMAIL_USER / EMAIL_PASS are not configured." });

      const [post] = await sql`
        select id, kind, title, body, location, starts_on::text as starts_on, emailed_at
        from updates where id = ${updateId} and published`;
      if (!post) return res.status(404).json({ error: "Only published posts can be emailed." });
      if (post.emailed_at && req.query.again !== "1") {
        return res.status(409).json({ error: "This post has already been emailed to subscribers.", emailedAt: post.emailed_at });
      }

      const subscribers = await sql`
        select email, token from subscribers where status = 'confirmed' order by confirmed_at limit ${MAX_PER_SEND + 1}`;
      if (subscribers.length === 0) return res.status(400).json({ error: "There are no confirmed subscribers yet." });
      if (subscribers.length > MAX_PER_SEND) {
        return res.status(400).json({ error: `More than ${MAX_PER_SEND} subscribers: too many to send from Gmail in one go.` });
      }

      const origin = `${req.headers["x-forwarded-proto"] ?? "https"}://${req.headers.host}`;
      const link = `${origin}/updates/${post.id}`;
      const when = [post.kind === "event" && post.starts_on ? post.starts_on : "", post.location ?? ""].filter(Boolean).join(" · ");
      const summary = excerpt(post.body, 600);
      const subject = `${post.kind === "event" ? "New event" : "New post"}: ${post.title}`;

      let sent = 0;
      const failed = [];
      for (const s of subscribers) {
        const unsubscribe = `${origin}/api/subscribe?action=unsubscribe&token=${s.token}`;
        try {
          await sendMail({
            to: s.email,
            subject,
            text: [post.title, when, summary, `Read more: ${link}`, `Unsubscribe: ${unsubscribe}`].filter(Boolean).join("\n\n"),
            html: emailHtml({
              heading: post.title,
              paragraphs: [when, summary].filter(Boolean),
              button: { href: link, label: post.kind === "event" ? "See the event" : "Read the post" },
              footer: `You're getting this because you subscribed to updates from Olanrewaju Illias. <a href="${escapeHtml(unsubscribe)}" style="color:#6b7280">Unsubscribe</a>`,
            }),
            headers: {
              "List-Unsubscribe": `<${unsubscribe}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
          sent += 1;
        } catch (error) {
          console.error("[subscribers] send failed", error);
          failed.push(s.email);
        }
      }

      if (sent > 0) await sql`update updates set emailed_at = now() where id = ${post.id}`;
      return res.status(200).json({ sent, failed: failed.length });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/admin/subscribers failed`, error);
    return res.status(500).json({ error: "Something went wrong with the email list." });
  }
}
