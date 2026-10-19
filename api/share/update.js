// GET /updates/:id (rewritten here by vercel.json) — the normal app page, but with that event/post's own
// title, description and cover photo in the link-preview tags, so sharing it on LinkedIn, X, Facebook,
// Instagram DMs or WhatsApp shows the post rather than the generic site card. Visitors get the same HTML
// and the app takes over as usual.
import { sql } from "../_lib/db.js";
import { excerpt, replaceSeo } from "../_lib/seo.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cachedTemplate = null;

/** The deployed home page HTML (index.html, with its hashed script/style tags). Fetched once per function instance. */
const loadTemplate = async (origin) => {
  if (cachedTemplate) return cachedTemplate;
  const headers = {};
  // Lets preview deployments with Vercel Authentication fetch their own page (Settings → Deployment Protection).
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) headers["x-vercel-protection-bypass"] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  // "/" rather than "/index.html": with cleanUrls on, Vercel redirects *.html paths to their extensionless form.
  const res = await fetch(`${origin}/`, { headers });
  if (!res.ok) throw new Error(`index.html fetch failed (${res.status})`);
  cachedTemplate = await res.text();
  return cachedTemplate;
};

const attr = (html, pattern) => html.match(pattern)?.[1] ?? "";

const formatDay = (iso, withYear = true) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });

const dateLabel = (row) => {
  if (!row.starts_on) return "";
  if (!row.ends_on || row.ends_on === row.starts_on) return formatDay(row.starts_on);
  return `${formatDay(row.starts_on, row.starts_on.slice(0, 4) !== row.ends_on.slice(0, 4))} – ${formatDay(row.ends_on)}`;
};

export default async function handler(req, res) {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const origin = `${proto}://${req.headers.host}`;

  let template;
  try {
    template = await loadTemplate(origin);
  } catch (error) {
    console.error("share/update: could not load index.html", error);
    // Without the template the app can't boot from here, so send people to the Updates page.
    res.setHeader("Location", "/updates");
    return res.status(302).end();
  }

  let row = null;
  if (UUID.test(id)) {
    try {
      [row] = await sql`
        select title, body, kind, location, starts_on::text as starts_on, ends_on::text as ends_on, images, created_at
        from updates where id = ${id} and published`;
    } catch (error) {
      console.error("share/update: query failed", error);
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!row) {
    // Unknown or unpublished: the app shows "This update isn't available"; keep the generic preview.
    res.setHeader("Cache-Control", "public, s-maxage=60");
    return res.status(404).send(template);
  }

  const siteName = attr(template, /property="og:site_name" content="([^"]*)"/) || "Olanrewaju Illias";
  const twitter = attr(template, /name="twitter:site" content="([^"]*)"/);
  const cover = (row.images ?? [])[0];
  const when = [row.kind === "event" ? dateLabel(row) : "", row.location ?? ""].filter(Boolean).join(" · ");
  const body = excerpt(row.body, when ? 170 : 200);
  const description = [when, body].filter(Boolean).join(" — ") || `${row.kind === "event" ? "Event" : "Post"} by ${siteName}`;

  const image = cover?.shareUrl
    ? { image: cover.shareUrl, imageWidth: 1200, imageHeight: 630 }
    : cover
      ? { image: cover.url }
      : { image: `${origin}/og-image.jpg`, imageWidth: 1200, imageHeight: 630 };

  const html = replaceSeo(template, {
    siteName,
    twitter,
    title: `${row.title} | ${siteName}`,
    description,
    url: `${origin}/updates/${id}`,
    type: "article",
    publishedTime: new Date(row.created_at).toISOString(),
    imageAlt: cover?.alt || row.title,
    ...image,
  });

  // Edits show up in new shares within ~5 minutes; each network also keeps its own cache (see README).
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  return res.status(200).send(html);
}
