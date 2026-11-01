// Public: GET /api/articles — published articles and papers for the Articles section.
import { sql, toArticle } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const rows = await sql`
      select id, title, summary, track, topic, file_url, file_name, scholar_url, zenodo_url, published_on::text as published_on,
             published, created_at, updated_at
      from articles
      where published
      order by coalesce(published_on, created_at::date) desc, created_at desc
      limit 200`;
    // Short CDN cache: a new article shows up within a minute without hitting the database on every visit.
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ articles: rows.map(toArticle) });
  } catch (error) {
    console.error("GET /api/articles failed", error);
    return res.status(500).json({ error: "Could not load articles." });
  }
}
