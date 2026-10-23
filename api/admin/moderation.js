// Admin only: review guest submissions. One function for both kinds keeps the project under Vercel's function limit.
//   GET    /api/admin/moderation?kind=recommendations|comments         everything, newest first
//   PATCH  /api/admin/moderation?kind=...&id=...   { status?, featured? }   approve / reject / feature
//   DELETE /api/admin/moderation?kind=...&id=...                       delete
import { z } from "zod";
import { sql, toComment, toRecommendation } from "../_lib/db.js";
import { readBody, requireAdmin } from "../_lib/auth.js";
import { firstError } from "../_lib/validate.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const patchInput = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => v.status !== undefined || v.featured !== undefined, "Nothing to change.");

const list = (kind) =>
  kind === "recommendations"
    ? sql`
        select id, name, relationship, role, company, body, linkedin_url, featured, email, status, reviewed_at, created_at
        from recommendations
        order by (status = 'pending') desc, created_at desc`
    : sql`
        select c.id, c.update_id, c.name, c.body, c.email, c.status, c.reviewed_at, c.created_at, u.title as update_title
        from update_comments c
        join updates u on u.id = c.update_id
        order by (c.status = 'pending') desc, c.created_at desc`;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!requireAdmin(req, res)) return;

  const kind = req.query.kind;
  if (kind !== "recommendations" && kind !== "comments") {
    return res.status(400).json({ error: "kind must be recommendations or comments." });
  }
  const id = typeof req.query.id === "string" ? req.query.id : null;
  if ((req.method === "PATCH" || req.method === "DELETE") && (!id || !UUID.test(id))) {
    return res.status(400).json({ error: "A valid id is required." });
  }

  try {
    if (req.method === "GET") {
      const rows = await list(kind);
      const map = kind === "recommendations" ? toRecommendation : toComment;
      return res.status(200).json({ items: rows.map((r) => map(r, true)) });
    }

    if (req.method === "PATCH") {
      const parsed = patchInput.safeParse(readBody(req) ?? {});
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });
      const { status = null, featured = null } = parsed.data;
      if (featured !== null && kind !== "recommendations") return res.status(400).json({ error: "Only recommendations can be featured." });

      const rows =
        kind === "recommendations"
          ? await sql`
              update recommendations
              set status = coalesce(${status}, status),
                  featured = coalesce(${featured}::boolean, featured),
                  reviewed_at = case when ${status}::text is null then reviewed_at else now() end
              where id = ${id}
              returning id`
          : await sql`
              update update_comments
              set status = ${status}, reviewed_at = now()
              where id = ${id}
              returning id`;
      if (rows.length === 0) return res.status(404).json({ error: "Not found." });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const rows =
        kind === "recommendations"
          ? await sql`delete from recommendations where id = ${id} returning id`
          : await sql`delete from update_comments where id = ${id} returning id`;
      if (rows.length === 0) return res.status(404).json({ error: "Not found." });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/admin/moderation failed`, error);
    return res.status(500).json({ error: "Could not update. Please try again." });
  }
}
