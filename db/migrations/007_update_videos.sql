-- Videos on events and posts, uploaded from /admin straight to the Neon bucket.
-- [{ "url": "...", "posterUrl": "...", "caption": "..." }], in display order. posterUrl is a still frame grabbed in
-- the browser at upload time, shown before the video plays.
alter table updates
  add column if not exists videos jsonb not null default '[]'::jsonb check (jsonb_typeof(videos) = 'array');
