create table if not exists admin_credentials (
  id text primary key,
  password_hash text not null,
  activated_at timestamptz not null default now(),
  password_updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
