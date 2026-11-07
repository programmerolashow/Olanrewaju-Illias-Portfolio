// Public: GET /api/feed — RSS 2.0 feed of published events and posts, for feed readers and newsletter tools.
// Each item links to /updates/:id, which already has its own link-preview tags (api/share/update.js).
import { sql } from "./_lib/db.js";
import { excerpt } from "./_lib/seo.js";

const SITE_NAME = "Olanrewaju Illias";

const xml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Characters XML 1.0 forbids; one stray control character would make readers reject the whole feed.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

const rfc822 = (date) => new Date(date).toUTCString();

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end("Method not allowed.");
  }

  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const origin = `${proto}://${req.headers.host}`;

  let rows;
  try {
    // Newest first by when it was posted (not pinned order: readers expect a chronological feed).
    rows = await sql`
      select id, kind, title, body, location, starts_on::text as starts_on, images, videos, created_at, updated_at
      from updates
      where published
      order by created_at desc
      limit 50`;
  } catch (error) {
    console.error("GET /api/feed failed", error);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).end("Could not load the feed.");
  }

  const items = rows.map((row) => {
    const link = `${origin}/updates/${row.id}`;
    const where = [row.kind === "event" && row.starts_on ? row.starts_on : "", row.location ?? ""].filter(Boolean).join(" · ");
    const description = [where, excerpt(row.body, 400)].filter(Boolean).join(" — ");
    const poster = (row.videos ?? []).find((v) => v.posterUrl)?.posterUrl;
    const cover = (row.images ?? [])[0] ?? (poster ? { url: poster } : undefined);
    return [
      "    <item>",
      `      <title>${xml(row.title)}</title>`,
      `      <link>${xml(link)}</link>`,
      `      <guid isPermaLink="true">${xml(link)}</guid>`,
      `      <pubDate>${rfc822(row.created_at)}</pubDate>`,
      `      <category>${row.kind === "event" ? "Event" : "Post"}</category>`,
      `      <description>${xml(description)}</description>`,
      cover?.url ? `      <enclosure url="${xml(cover.url)}" type="image/${/\.png(\?|$)/i.test(cover.url) ? "png" : /\.webp(\?|$)/i.test(cover.url) ? "webp" : "jpeg"}" length="0" />` : "",
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const lastBuild = rows.length ? rfc822(rows.reduce((a, r) => (r.updated_at > a ? r.updated_at : a), rows[0].updated_at)) : rfc822(Date.now());

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(`${SITE_NAME}: Updates`)}</title>
    <link>${xml(`${origin}/updates`)}</link>
    <atom:link href="${xml(`${origin}/api/feed`)}" rel="self" type="application/rss+xml" />
    <description>${xml(`Events ${SITE_NAME} is attending or speaking at, and his latest posts.`)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>
`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  // Same freshness as /api/updates: a new post reaches readers within minutes without a query per poll.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).end(req.method === "HEAD" ? undefined : body);
}
