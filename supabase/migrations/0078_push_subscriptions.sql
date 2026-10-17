-- Devices that allowed streak reminders (Web Push). Server-only: RLS on, no policies.
create table push_subscriptions (
  id bigserial primary key,
  user_id uuid not null references profiles on delete cascade,
  endpoint text not null unique check (char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on push_subscriptions (user_id);
alter table push_subscriptions enable row level security;
