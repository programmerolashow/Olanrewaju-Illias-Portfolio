-- Published articles and papers, uploaded from /admin and listed on /articles.
-- Each one is a file (PDF or Word) in the Neon bucket, optionally linked to its Google Scholar entry.
-- Do not edit after it has been applied; add a new file instead.

create table if not exists articles (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 200),
  summary       text not null default '' check (char_length(summary) <= 600),
  -- One of the track ids in src/lib/articles.ts (e.g. 'database'); not checked here,
  -- so adding a track never needs a migration.
  track         text not null check (char_length(track) between 1 and 40),
  file_url      text check (char_length(file_url) <= 500),
  -- Original file name, used for the download name and to show PDF vs Word.
  file_name     text check (char_length(file_name) <= 200),
  scholar_url   text check (char_length(scholar_url) <= 500),
  published_on  date,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (file_url is not null or scholar_url is not null)
);

create index if not exists articles_published_idx on articles (published, published_on desc nulls last, created_at desc);
