-- Optional helpers to target notifications to a specific user identity

-- fcm_tokens: add user column and unique constraint on token
alter table if exists public.fcm_tokens
  add column if not exists "user" text;
create unique index if not exists fcm_tokens_token_key on public.fcm_tokens(token);
create index if not exists fcm_tokens_user_idx on public.fcm_tokens("user");

-- webpush_subscriptions: add user column to target pushes
alter table if exists public.webpush_subscriptions
  add column if not exists "user" text;
create unique index if not exists webpush_endpoint_key on public.webpush_subscriptions(endpoint);
create index if not exists webpush_user_idx on public.webpush_subscriptions("user");

-- notifications table assumed to exist with columns: id, title, body, icon, link, read, created_at
-- If not present, create a minimal table (adjust to your existing schema)
-- create table if not exists public.notifications (
--   id bigint generated always as identity primary key,
--   title text not null,
--   body text not null,
--   icon text,
--   link text,
--   read boolean not null default false,
--   created_at timestamptz not null default now()
-- );

