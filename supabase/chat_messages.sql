-- Run this in Supabase SQL editor once to create the chat table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  "from" text not null,
  "to" text not null,
  created_at timestamptz not null default now()
);

-- Optional: enable Row Level Security and allow simple read/write for authenticated anon if desired
-- alter table public.chat_messages enable row level security;
-- create policy "Allow read all" on public.chat_messages for select using (true);
-- create policy "Allow insert" on public.chat_messages for insert with check (true);

