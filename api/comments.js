// Public: comments on events and posts.
//   GET  /api/comments?updateId=...   approved comments on one published post, oldest first
//   POST /api/comments                submit one; held as pending until approved in /admin
import { sql, toComment } from "./_lib/db.js";
import { guestBody, ipHash, overLimit } from "./_lib/guest.js";
import { commentInput, firstError } from "./_lib/validate.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const updateId = typeof req.query.updateId === "string" ? req.query.updateId : "";
      if (!UUID.test(updateId)) return res.status(400).json({ error: "A valid updateId is required." });
      const rows = await sql`
        select c.id, c.update_id, c.name, c.body, c.created_at
        from update_comments c
        join updates u on u.id = c.update_id and u.published
        where c.update_id = ${updateId} and c.status = 'approved'
        order by c.created_at asc
        limit 500`;
      res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
      return res.status(200).json({ comments: rows.map((r) => toComment(r)) });
    }

    if (req.method === "POST") {
      const body = guestBody(req, res);
      if (!body) return;
      const parsed = commentInput.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });

      const hash = ipHash(req);
      if (await overLimit("update_comments", hash, 5, 1)) {
        return res.status(429).json({ error: "You've commented a lot in the last hour. Please try again later." });
      }

      const v = parsed.data;
      const inserted = await sql`
        insert into update_comments (update_id, name, body, email, ip_hash)
        select id, ${v.name}, ${v.body}, ${v.email}, ${hash} from updates where id = ${v.updateId} and published
        returning id`;
      if (inserted.length === 0) return res.status(404).json({ error: "This post isn't available any more." });
      return res.status(201).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/comments failed`, error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
