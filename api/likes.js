// Public: likes on events and posts.
//   GET  /api/likes?updateId=...&visitorId=...   { count, liked }
//   POST /api/likes  { updateId, visitorId, liked }   sets this visitor's like on or off; returns { count, liked }
// visitorId is a random id the browser keeps in localStorage. It isn't proof of anything, so likes are a friendly
// signal, not a vote: each IP is also capped at LIMIT changes an hour.
import { sql } from "./_lib/db.js";
import { sameOrigin, readBody } from "./_lib/auth.js";
import { ipHash } from "./_lib/guest.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VISITOR = /^[A-Za-z0-9_-]{16,64}$/;
const LIMIT = 60;

const state = async (updateId, visitorId) => {
  const [row] = await sql`
    select count(*)::int as count, coalesce(bool_or(visitor_id = ${visitorId}), false) as liked
    from update_likes where update_id = ${updateId}`;
  return { count: row.count, liked: row.liked };
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const updateId = typeof req.query.updateId === "string" ? req.query.updateId : "";
      const visitorId = typeof req.query.visitorId === "string" ? req.query.visitorId : "";
      if (!UUID.test(updateId)) return res.status(400).json({ error: "A valid updateId is required." });
      return res.status(200).json(await state(updateId, VISITOR.test(visitorId) ? visitorId : ""));
    }

    if (req.method === "POST") {
      if (!sameOrigin(req)) return res.status(403).json({ error: "Cross-site request blocked." });
      const { updateId, visitorId, liked } = readBody(req) ?? {};
      if (!UUID.test(updateId ?? "") || !VISITOR.test(visitorId ?? "") || typeof liked !== "boolean") {
        return res.status(400).json({ error: "Invalid request." });
      }

      const hash = ipHash(req);
      const [{ recent }] = await sql`
        select count(*)::int as recent from update_likes where ip_hash = ${hash} and created_at > now() - interval '1 hour'`;
      if (liked && recent >= LIMIT) return res.status(429).json({ error: "Too many likes from here. Try again later." });

      if (liked) {
        // Only published posts can be liked; a second like from the same visitor is a no-op.
        await sql`
          insert into update_likes (update_id, visitor_id, ip_hash)
          select id, ${visitorId}, ${hash} from updates where id = ${updateId} and published
          on conflict (update_id, visitor_id) do nothing`;
      } else {
        await sql`delete from update_likes where update_id = ${updateId} and visitor_id = ${visitorId}`;
      }
      return res.status(200).json(await state(updateId, visitorId));
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/likes failed`, error);
    return res.status(500).json({ error: "Could not save your like." });
  }
}
