# Olanrewaju Illias — Portfolio

Personal portfolio of Olanrewaju Illias, full-stack product engineer.

Live site: https://olanrewaju-illias-portfolio.vercel.app

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui and Framer Motion, deployed on Vercel. The contact form is handled by `api/contact.js` on Vercel, and by the Express server in `backend/` during local development.

## Running locally

```sh
npm install
npm run dev            # site on http://localhost:8080
cd backend && npm run dev   # optional: contact API on :5000
```

`npm run build` creates the production build in `dist/`.

## Where things live

| What | File |
| --- | --- |
| Site URL, title, availability line, analytics ID, CV path | `src/config/site.ts` |
| Projects and case studies | `src/data/projects.ts` |
| How I Work page content | `src/data/approach.ts` |
| Recommendations and comments (moderated in `/admin`) | `api/recommendations.js`, `api/comments.js` |
| Moments gallery | `src/data/gallery.ts` |
| Navigation | `src/data/navigation.ts` |

Set `cvPath` in `src/config/site.ts` to your CV in `public/` and the download buttons appear on the next build.

## Vercel environment variables

Set these in Vercel → Project → Settings → Environment Variables (Production), then redeploy:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `ADMIN_PASSWORD` | `/admin` password, 12+ characters |
| `SESSION_SECRET` | random string, 32+ characters |
| `NEON_S3_ENDPOINT` | same as `AWS_ENDPOINT_URL_S3` in `.env.local` |
| `NEON_S3_REGION` | same as `AWS_REGION` |
| `NEON_S3_ACCESS_KEY_ID` | same as `AWS_ACCESS_KEY_ID` |
| `NEON_S3_SECRET_ACCESS_KEY` | same as `AWS_SECRET_ACCESS_KEY` |

Vercel reserves the `AWS_*` names, so the `NEON_S3_*` ones are required there for photo uploads in `/admin`.

## Link previews (LinkedIn, X, Facebook, WhatsApp, Instagram DMs)

- **Fixed pages and projects:** the build writes `services.html`, `projects/<slug>.html`, … each with its own title, description and image (titles and descriptions live in `src/config/pages.ts` and `src/data/projects.ts`). After adding or renaming a project, run `npm run og:cards` (needs Python + Pillow) to make its 1200×630 card in `public/og/projects/`.
- **Events and posts:** `/updates/<id>` is served by `api/share/update.js`, which uses the post's cover photo. Every photo uploaded in `/admin` also gets a 1200×630 JPEG share copy for this.
- **Networks cache previews.** After changing one, refresh it: Facebook/Instagram/WhatsApp at developers.facebook.com/tools/debug ("Scrape Again"), LinkedIn at linkedin.com/post-inspector. X refreshes on its own within about a week.
- Instagram only shows link previews in DMs (not in posts or the bio link); those use the same Facebook tags.

## Credits

Background map of Nigeria (`public/nigeria-map.svg`): state boundaries from [geoBoundaries](https://www.geoboundaries.org) (gbOpen NGA ADM1, source: GRID3), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Simplified and converted to SVG. `sitemap.xml` and `robots.txt` are generated at build time from `src/config/site.ts`.
