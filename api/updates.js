// Public: GET /api/updates — published events and posts for the Updates section.
import { sql, toUpdate } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const rows = await sql`
      select id, kind, title, body, location, starts_on::text as starts_on, ends_on::text as ends_on,
             link_url, images, published, pinned, created_at, updated_at
      from updates
      where published
      order by pinned desc, coalesce(starts_on, created_at::date) desc, created_at desc
      limit 100`;
    // Short CDN cache: a new post shows up within a minute without hitting the database on every visit.
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ updates: rows.map(toUpdate) });
  } catch (error) {
    console.error("GET /api/updates failed", error);
    return res.status(500).json({ error: "Could not load updates." });
  }
}
