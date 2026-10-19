-- Events and posts published from /admin and shown in the Updates section.
-- Applied once to the portfolio Neon database. Do not edit after it has been applied; add a new file instead.

create table if not exists updates (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('event', 'post')),
  title       text not null check (char_length(title) between 1 and 160),
  body        text not null default '' check (char_length(body) <= 10000),
  location    text check (char_length(location) <= 160),
  -- Event dates. "Happening now" / "Upcoming" / "Past" are worked out from these, so the label never goes stale.
  starts_on   date,
  ends_on     date,
  link_url    text check (char_length(link_url) <= 500),
  -- [{ "url": "...", "alt": "..." }], in display order. The first image is the cover.
  images      jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  published   boolean not null default false,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (ends_on is null or starts_on is not null),
  check (ends_on is null or ends_on >= starts_on)
);

create index if not exists updates_published_idx on updates (published, created_at desc);

-- Failed admin logins, used to slow down password guessing.
create table if not exists admin_login_attempts (
  id          bigint generated always as identity primary key,
  ip          text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_idx on admin_login_attempts (ip, attempted_at desc);
