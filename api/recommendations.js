// Public: recommendations from people Illias has worked with.
//   GET  /api/recommendations   approved ones, featured first
//   POST /api/recommendations   submit one; held as pending until approved in /admin
import { sql, toRecommendation } from "./_lib/db.js";
import { guestBody, ipHash, overLimit } from "./_lib/guest.js";
import { firstError, recommendationInput } from "./_lib/validate.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = await sql`
        select id, name, relationship, role, company, body, linkedin_url, featured, created_at
        from recommendations
        where status = 'approved'
        order by featured desc, created_at desc
        limit 200`;
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res.status(200).json({ recommendations: rows.map((r) => toRecommendation(r)) });
    }

    if (req.method === "POST") {
      const body = guestBody(req, res);
      if (!body) return;
      const parsed = recommendationInput.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });

      const hash = ipHash(req);
      if (await overLimit("recommendations", hash, 3, 24)) {
        return res.status(429).json({ error: "You've already sent a few recommendations today. Thank you! Try again tomorrow." });
      }

      const v = parsed.data;
      await sql`
        insert into recommendations (name, relationship, role, company, body, linkedin_url, email, ip_hash)
        values (${v.name}, ${v.relationship}, ${v.role}, ${v.company}, ${v.body}, ${v.linkedinUrl}, ${v.email}, ${hash})`;
      return res.status(201).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/recommendations failed`, error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
