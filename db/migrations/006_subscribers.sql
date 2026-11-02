-- Email sign-up for Updates. Double opt-in: a row starts 'pending' and only becomes 'confirmed' when the link
-- in the confirmation email is opened. Only confirmed rows are ever emailed.
-- Do not edit after it has been applied; add a new file instead.

create table if not exists subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            text not null check (char_length(email) between 3 and 200),
  status           text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  -- Random secret in the confirm and unsubscribe links. Never returned by any API.
  token            text not null unique check (char_length(token) >= 32),
  -- Salted hash of the sign-up IP, only for rate limiting.
  ip_hash          text not null,
  created_at       timestamptz not null default now(),
  confirm_sent_at  timestamptz not null default now(),
  confirmed_at     timestamptz,
  unsubscribed_at  timestamptz
);

-- One row per address, whatever its capitalisation.
create unique index if not exists subscribers_email_idx on subscribers (lower(email));
create index if not exists subscribers_status_idx on subscribers (status);
create index if not exists subscribers_ip_idx on subscribers (ip_hash, created_at desc);

-- When a post was emailed to subscribers from /admin, so it isn't sent twice by accident.
alter table updates add column if not exists emailed_at timestamptz;
