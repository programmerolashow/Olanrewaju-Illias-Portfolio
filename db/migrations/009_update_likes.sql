-- Likes on events and posts. One per visitor per post: visitor_id is a random id the browser keeps in
-- localStorage, so a like can be undone. ip_hash (salted, as elsewhere) is only for rate limiting.
-- Do not edit after it has been applied; add a new file instead.

create table if not exists update_likes (
  update_id   uuid not null references updates (id) on delete cascade,
  visitor_id  text not null check (char_length(visitor_id) between 16 and 64),
  ip_hash     text not null,
  created_at  timestamptz not null default now(),
  primary key (update_id, visitor_id)
);

create index if not exists update_likes_ip_idx on update_likes (ip_hash, created_at desc);
