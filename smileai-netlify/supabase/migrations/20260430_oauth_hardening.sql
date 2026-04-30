-- Single-use OAuth state store
create table if not exists oauth_states (
  state text primary key,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists oauth_states_expires_at_idx on oauth_states (expires_at);

alter table oauth_states enable row level security;
drop policy if exists "service_role_only_oauth_states" on oauth_states;
create policy "service_role_only_oauth_states" on oauth_states
  using (auth.role() = 'service_role');

-- Drop the deprecated duplicate tables
drop table if exists ghl_tokens cascade;
drop table if exists ghl_installs cascade;
