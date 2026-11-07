// Admin only: the Moments gallery.
//   GET    /api/admin/moments          everything, hidden ones included, in display order
//   POST   /api/admin/moments          add (goes to the top of the gallery)
//   PUT    /api/admin/moments?id=...   replace
//   PATCH  /api/admin/moments          reorder: { ids: [...] } in the new display order
//   DELETE /api/admin/moments?id=...   delete (and its uploaded files; /gallery/ files that shipped with the site stay)
import { sql, toMoment } from "../_lib/db.js";
import { deleteFiles } from "../_lib/storage.js";
import { readBody, requireAdmin } from "../_lib/auth.js";
import { firstError, momentInput, momentOrderInput } from "../_lib/validate.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const files = (row) => [row.src, row.poster].filter(Boolean);

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
        select id, type, src, poster, title, caption, category, date_label, location, size, focus, position, published
        from moments
        order by position, created_at desc`;
      return res.status(200).json({ moments: rows.map(toMoment) });
    }

    if (req.method === "PATCH") {
      const parsed = momentOrderInput.safeParse(readBody(req) ?? {});
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });
      await sql`
        update moments m set position = o.ord::int - 1, updated_at = now()
        from unnest(${parsed.data.ids}::uuid[]) with ordinality as o(id, ord)
        where m.id = o.id`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const parsed = momentInput.safeParse(readBody(req) ?? {});
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });
      const v = parsed.data;
      if (v.type === "image" && v.poster) return res.status(400).json({ error: "Only videos have a poster." });

      if (req.method === "POST") {
        const [row] = await sql`
          insert into moments (type, src, poster, title, caption, category, date_label, location, size, focus, published, position)
          values (${v.type}, ${v.src}, ${v.poster}, ${v.title}, ${v.caption}, ${v.category}, ${v.date}, ${v.location}, ${v.size},
                  ${v.focus}, ${v.published}, (select coalesce(min(position), 0) - 1 from moments))
          returning id, type, src, poster, title, caption, category, date_label, location, size, focus, position, published`;
        return res.status(201).json({ moment: toMoment(row) });
      }

      const [before] = await sql`select src, poster from moments where id = ${id}`;
      if (!before) return res.status(404).json({ error: "Moment not found." });
      const [row] = await sql`
        update moments set
          type = ${v.type}, src = ${v.src}, poster = ${v.poster}, title = ${v.title}, caption = ${v.caption},
          category = ${v.category}, date_label = ${v.date}, location = ${v.location}, size = ${v.size}, focus = ${v.focus},
          published = ${v.published}, updated_at = now()
        where id = ${id}
        returning id, type, src, poster, title, caption, category, date_label, location, size, focus, position, published`;
      const kept = new Set(files(v));
      await deleteFiles(files(before).filter((url) => !kept.has(url)));
      return res.status(200).json({ moment: toMoment(row) });
    }

    if (req.method === "DELETE") {
      const [row] = await sql`delete from moments where id = ${id} returning src, poster`;
      if (!row) return res.status(404).json({ error: "Moment not found." });
      // deleteFiles only touches bucket URLs, so /gallery/ files that shipped with the site stay.
      await deleteFiles(files(row));
      return res.status(200).json({ deleted: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/admin/moments failed`, error);
    return res.status(500).json({ error: "Something went wrong saving the moment." });
  }
}
