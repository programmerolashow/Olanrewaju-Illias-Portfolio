// Shared Neon connection for the /api functions. Files under api/_lib are helpers, not routes.
// Set DATABASE_URL in Vercel → Project → Settings → Environment Variables.
import { neon } from "@neondatabase/serverless";

let client;

export const sql = (...args) => {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
    client = neon(process.env.DATABASE_URL);
  }
  return client(...args);
};

/** Columns returned to the browser; keeps internal fields out of responses. */
export const toUpdate = (row) => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  body: row.body,
  location: row.location,
  // Queries select dates as ::text ("YYYY-MM-DD") so no timezone conversion can shift them by a day.
  startsOn: row.starts_on,
  endsOn: row.ends_on,
  linkUrl: row.link_url,
  images: row.images ?? [],
  published: row.published,
  pinned: row.pinned,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
