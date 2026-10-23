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

/** Public shape of a recommendation; the admin view adds email, status and reviewedAt. */
export const toRecommendation = (row, admin = false) => ({
  id: row.id,
  name: row.name,
  relationship: row.relationship,
  role: row.role,
  company: row.company,
  body: row.body,
  linkedinUrl: row.linkedin_url,
  featured: row.featured,
  createdAt: row.created_at,
  ...(admin ? { email: row.email, status: row.status, reviewedAt: row.reviewed_at } : {}),
});

/** Public shape of a comment; the admin view adds email, status and the post it belongs to. */
export const toComment = (row, admin = false) => ({
  id: row.id,
  updateId: row.update_id,
  name: row.name,
  body: row.body,
  createdAt: row.created_at,
  ...(admin ? { email: row.email, status: row.status, reviewedAt: row.reviewed_at, updateTitle: row.update_title } : {}),
});
