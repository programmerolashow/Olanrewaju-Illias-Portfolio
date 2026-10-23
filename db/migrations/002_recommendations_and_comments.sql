-- Guest submissions: recommendations from people Illias has worked with, and comments on events and posts.
-- Both are held as 'pending' until approved in /admin; only 'approved' rows are ever returned to visitors.
-- Do not edit after it has been applied; add a new file instead.

create table if not exists recommendations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 100),
  relationship  text not null check (relationship in
                  ('colleague', 'manager', 'teammate', 'classmate', 'course_mate', 'collaborator', 'client', 'mentor', 'mentee', 'other')),
  -- Their own role and organisation, e.g. "Product Lead" at "Qorelly".
  role          text check (char_length(role) <= 120),
  company       text check (char_length(company) <= 120),
  body          text not null check (char_length(body) between 40 and 2000),
  linkedin_url  text check (char_length(linkedin_url) <= 300),
  -- Private: lets Illias confirm the recommendation is genuine. Never returned by the public API.
  email         text check (char_length(email) <= 200),
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- Featured ones show first, and on the home page.
  featured      boolean not null default false,
  -- Salted hash of the submitter's IP, only for rate limiting.
  ip_hash       text not null,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);

create index if not exists recommendations_public_idx on recommendations (status, featured desc, created_at desc);
create index if not exists recommendations_ip_idx on recommendations (ip_hash, created_at desc);

create table if not exists update_comments (
  id          uuid primary key default gen_random_uuid(),
  update_id   uuid not null references updates (id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 80),
  body        text not null check (char_length(body) between 2 and 2000),
  -- Private, optional: lets Illias reply. Never returned by the public API.
  email       text check (char_length(email) <= 200),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists update_comments_public_idx on update_comments (update_id, status, created_at);
create index if not exists update_comments_review_idx on update_comments (status, created_at desc);
create index if not exists update_comments_ip_idx on update_comments (ip_hash, created_at desc);
