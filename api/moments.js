// Public: GET /api/moments — published photos and videos for the Moments gallery, in display order.
import { sql, toMoment } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const rows = await sql`
      select id, type, src, poster, title, caption, category, date_label, location, size, focus, position, published
      from moments
      where published
      order by position, created_at desc
      limit 500`;
    // Short CDN cache: a new moment shows up within a minute without hitting the database on every visit.
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ moments: rows.map(toMoment) });
  } catch (error) {
    console.error("GET /api/moments failed", error);
    return res.status(500).json({ error: "Could not load moments." });
  }
}
