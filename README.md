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
| Testimonials (hidden while empty) | `src/data/testimonials.ts` |
| Moments gallery | `src/data/gallery.ts` |
| Navigation | `src/data/navigation.ts` |

Drop a CV at `public/cv.pdf` and the download buttons appear on the next build. `sitemap.xml` and `robots.txt` are generated at build time from `src/config/site.ts`.
