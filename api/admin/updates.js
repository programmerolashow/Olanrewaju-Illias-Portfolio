// Admin only: list, create, edit and delete events and posts.
//   GET    /api/admin/updates          all posts, drafts included
//   POST   /api/admin/updates          create
//   PUT    /api/admin/updates?id=...   replace
//   DELETE /api/admin/updates?id=...   delete (and its uploaded images)
import { sql, toUpdate } from "../_lib/db.js";
import { deleteImages } from "../_lib/storage.js";
import { readBody, requireAdmin } from "../_lib/auth.js";
import { firstError, updateInput } from "../_lib/validate.js";

/** Every stored file behind a post's photos: the display image and its link-preview copy. */
const fileUrls = (images) => (images ?? []).flatMap((i) => [i.url, i.shareUrl]).filter(Boolean);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!requireAdmin(req, res)) return;

  const id = typeof req.query.id === "string" ? req.query.id : null;
  if ((req.method === "PUT" || req.method === "DELETE") && (!id || !UUID.test(id))) {
    return res.status(400).json({ error: "A valid id is required." });
  }

  try {
    if (req.method === "GET") {
      const rows = await sql`
        select id, kind, title, body, location, starts_on::text as starts_on, ends_on::text as ends_on,
               link_url, images, published, pinned, created_at, updated_at
        from updates
        order by created_at desc`;
      return res.status(200).json({ updates: rows.map(toUpdate) });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const parsed = updateInput.safeParse(readBody(req) ?? {});
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });
      const v = parsed.data;
      const images = JSON.stringify(v.images);

      if (req.method === "POST") {
        const [row] = await sql`
          insert into updates (kind, title, body, location, starts_on, ends_on, link_url, images, published, pinned)
          values (${v.kind}, ${v.title}, ${v.body}, ${v.location}, ${v.startsOn}, ${v.endsOn}, ${v.linkUrl},
                  ${images}::jsonb, ${v.published}, ${v.pinned})
          returning id, kind, title, body, location, starts_on::text as starts_on, ends_on::text as ends_on,
                    link_url, images, published, pinned, created_at, updated_at`;
        return res.status(201).json({ update: toUpdate(row) });
      }

      const [before] = await sql`select images from updates where id = ${id}`;
      if (!before) return res.status(404).json({ error: "Post not found." });
      const [row] = await sql`
        update updates set
          kind = ${v.kind}, title = ${v.title}, body = ${v.body}, location = ${v.location},
          starts_on = ${v.startsOn}, ends_on = ${v.endsOn}, link_url = ${v.linkUrl}, images = ${images}::jsonb,
          published = ${v.published}, pinned = ${v.pinned}, updated_at = now()
        where id = ${id}
        returning id, kind, title, body, location, starts_on::text as starts_on, ends_on::text as ends_on,
                  link_url, images, published, pinned, created_at, updated_at`;
      const kept = new Set(fileUrls(v.images));
      await deleteImages(fileUrls(before.images).filter((url) => !kept.has(url)));
      return res.status(200).json({ update: toUpdate(row) });
    }

    if (req.method === "DELETE") {
      const [row] = await sql`delete from updates where id = ${id} returning images`;
      if (!row) return res.status(404).json({ error: "Post not found." });
      await deleteImages(fileUrls(row.images));
      return res.status(200).json({ deleted: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/admin/updates failed`, error);
    return res.status(500).json({ error: "Something went wrong saving the post." });
  }
}
