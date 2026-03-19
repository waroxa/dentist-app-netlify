create table if not exists leads (
  id uuid primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  interested_in text,
  notes text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists smile_jobs (
  id uuid primary key,
  lead_id uuid references leads(id) on delete set null,
  type text not null,
  status text not null,
  provider_job_id text,
  input_image_data_url text,
  output_image_data_url text,
  output_asset_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integration_connections (
  provider text not null,
  location_id text not null,
  access_token_encrypted text,
  refresh_token_encrypted text,
  scope text,
  expires_at timestamptz,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (provider, location_id)
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
