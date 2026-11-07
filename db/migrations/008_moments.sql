-- Moments gallery (/moments), managed from /admin. Replaces editing src/data/gallery.ts by hand; that file is now
-- only the fallback shown if the database can't be reached.
-- Do not edit after it has been applied; add a new file instead.

create table if not exists moments (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('image', 'video')),
  -- A bucket URL for anything added in /admin, or a /gallery/... path for the photos that shipped with the site.
  src         text not null check (char_length(src) between 1 and 500),
  -- Videos only: still frame shown before playback.
  poster      text check (char_length(poster) <= 500),
  title       text not null check (char_length(title) between 1 and 120),
  caption     text not null default '' check (char_length(caption) <= 300),
  -- Filter chip on the Moments page, e.g. 'Events'. Free text so a new category never needs a migration.
  category    text not null check (char_length(category) between 1 and 40),
  -- Free text as shown on the card, e.g. '2026' or 'Nov 2025'.
  date_label  text check (char_length(date_label) <= 40),
  location    text check (char_length(location) <= 120),
  -- Card shape in the grid.
  size        text not null default 'square' check (size in ('square', 'tall', 'wide', 'large')),
  -- CSS object-position, e.g. 'center 30%', to keep faces in frame.
  focus       text check (char_length(focus) <= 40),
  -- Display order, lowest first.
  position    integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists moments_published_idx on moments (published, position);

-- The gallery as it was in src/data/gallery.ts when this was written, in the same order.
insert into moments (type, src, poster, title, caption, category, date_label, location, size, focus, position) values
  ('image', '/gallery/devfest-ilorin-2026-main-hall.webp', null, 'DevFest Ilorin 2026', 'Connecting Developers Globally: the main hall at DevFest Ilorin 2026', 'Events', '2026', 'Ilorin, Nigeria', 'large', 'center 45%', 0),
  ('image', '/gallery/devfest-ilorin-2026-portrait.webp', null, 'Back at DevFest', 'At the DevFest Ilorin 2026 backdrop', 'Portraits', '2026', 'Ilorin, Nigeria', 'tall', 'center 25%', 1),
  ('image', '/gallery/devfest-ilorin-2026-qorelly-corner.webp', null, 'DevFest Ilorin × Qorelly', 'A conversation at the Qorelly corner', 'Community', '2026', 'Ilorin, Nigeria', 'tall', 'center 60%', 2),
  ('image', '/gallery/devfest-ilorin-2026-firebase-session.webp', null, 'Building with Firebase', 'A Firebase session on the main stage', 'Events', '2026', 'Ilorin, Nigeria', 'square', 'center 40%', 3),
  ('image', '/gallery/devfest-ilorin-2026-live-demo.webp', null, 'Live on Stage', 'Android development, demoed live', 'Events', '2026', 'Ilorin, Nigeria', 'square', 'center 55%', 4),
  ('image', '/gallery/devfest-ilorin-2026-audience.webp', null, 'Notebooks Out', 'Developers taking notes through the sessions', 'Community', '2026', 'Ilorin, Nigeria', 'tall', null, 5),
  ('image', '/gallery/build-with-ai-group.webp', null, 'Build with AI 2026', 'The Google Developer Groups community at Build with AI', 'Community', '2026', null, 'large', null, 6),
  ('image', '/gallery/gemini-lagos.webp', null, 'Gemini Lagos', 'Connecting with the Google Gemini community', 'Events', null, 'Lagos, Nigeria', 'tall', 'center 25%', 7),
  ('image', '/gallery/ilorin-innovation-hub-building.webp', null, 'Heads Down, Building', 'Hands-on build session at Ilorin Innovation Hub', 'Workshops', null, 'Ilorin, Nigeria', 'square', null, 8),
  ('image', '/gallery/devfest-ilorin-duo.webp', null, 'DevFest Ilorin 2025', 'Google Developer Groups'' flagship developer festival', 'Events', '2025', 'Ilorin, Nigeria', 'square', 'center 30%', 9),
  ('image', '/gallery/build-with-ai-stage.webp', null, 'On Stage at Build with AI', 'A panel moment at Build with AI 2026', 'Events', '2026', null, 'wide', null, 10),
  ('image', '/gallery/portrait-yellow-wall.webp', null, 'Olanrewaju Illias', 'Full-Stack Product Engineer', 'Portraits', null, null, 'tall', 'center 20%', 11),
  ('image', '/gallery/ilorin-innovation-hub-session.webp', null, 'Ilorin Innovation Hub', 'Learning sessions with the local tech community', 'Workshops', null, 'Ilorin, Nigeria', 'wide', null, 12),
  ('image', '/gallery/malhub-career-event.webp', null, 'MALhub Tech Career Event', 'Empowering Africa''s next tech talent', 'Events', null, null, 'square', 'center 30%', 13),
  ('image', '/gallery/careerfest-stage.webp', null, 'CareerFest', 'On stage with fellow participants at a GDG CareerFest', 'Events', null, null, 'wide', null, 14),
  ('image', '/gallery/careerfest-portrait.webp', null, 'Between Sessions', 'CareerFest', 'Portraits', null, null, 'tall', 'center 35%', 15),
  ('image', '/gallery/ilorin-innovation-hub-audience.webp', null, 'In the Room', 'Learning alongside the developer community', 'Community', null, 'Ilorin, Nigeria', 'square', null, 16),
  ('image', '/gallery/with-colleagues.webp', null, 'With the Team', 'Good people, good work', 'Community', null, null, 'square', 'center 35%', 17),
  ('image', '/gallery/devfest-ilorin-portrait.webp', null, 'DevFest Ilorin', 'Showing up for the developer community', 'Portraits', '2025', 'Ilorin, Nigeria', 'square', 'center 40%', 18),
  ('image', '/gallery/build-with-ai-audience.webp', null, 'Build with AI, Front Row', 'Taking it all in at Build with AI 2026', 'Community', '2026', null, 'square', null, 19);
