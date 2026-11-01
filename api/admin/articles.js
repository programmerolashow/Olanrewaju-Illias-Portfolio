// Admin only: list, create, edit and delete articles.
//   GET    /api/admin/articles          all articles, drafts included
//   POST   /api/admin/articles          create
//   PUT    /api/admin/articles?id=...   replace
//   DELETE /api/admin/articles?id=...   delete (and its uploaded file)
import { sql, toArticle } from "../_lib/db.js";
import { deleteFiles } from "../_lib/storage.js";
import { readBody, requireAdmin } from "../_lib/auth.js";
import { articleInput, firstError } from "../_lib/validate.js";

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
        select id, title, summary, track, topic, file_url, file_name, scholar_url, zenodo_url, published_on::text as published_on,
               published, created_at, updated_at
        from articles
        order by coalesce(published_on, created_at::date) desc, created_at desc`;
      return res.status(200).json({ articles: rows.map(toArticle) });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const parsed = articleInput.safeParse(readBody(req) ?? {});
      if (!parsed.success) return res.status(400).json({ error: firstError(parsed.error) });
      const v = parsed.data;

      if (req.method === "POST") {
        const [row] = await sql`
          insert into articles (title, summary, track, topic, file_url, file_name, scholar_url, zenodo_url, published_on, published)
          values (${v.title}, ${v.summary}, ${v.track}, ${v.topic}, ${v.fileUrl}, ${v.fileName}, ${v.scholarUrl},
                  ${v.zenodoUrl}, ${v.publishedOn}, ${v.published})
          returning id, title, summary, track, topic, file_url, file_name, scholar_url, zenodo_url, published_on::text as published_on,
                    published, created_at, updated_at`;
        return res.status(201).json({ article: toArticle(row) });
      }

      const [before] = await sql`select file_url from articles where id = ${id}`;
      if (!before) return res.status(404).json({ error: "Article not found." });
      const [row] = await sql`
        update articles set
          title = ${v.title}, summary = ${v.summary}, track = ${v.track}, topic = ${v.topic}, file_url = ${v.fileUrl},
          file_name = ${v.fileName}, scholar_url = ${v.scholarUrl}, zenodo_url = ${v.zenodoUrl}, published_on = ${v.publishedOn},
          published = ${v.published}, updated_at = now()
        where id = ${id}
        returning id, title, summary, track, topic, file_url, file_name, scholar_url, zenodo_url, published_on::text as published_on,
                  published, created_at, updated_at`;
      if (before.file_url && before.file_url !== v.fileUrl) await deleteFiles([before.file_url]);
      return res.status(200).json({ article: toArticle(row) });
    }

    if (req.method === "DELETE") {
      const [row] = await sql`delete from articles where id = ${id} returning file_url`;
      if (!row) return res.status(404).json({ error: "Article not found." });
      if (row.file_url) await deleteFiles([row.file_url]);
      return res.status(200).json({ deleted: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(`${req.method} /api/admin/articles failed`, error);
    return res.status(500).json({ error: "Something went wrong saving the article." });
  }
}
