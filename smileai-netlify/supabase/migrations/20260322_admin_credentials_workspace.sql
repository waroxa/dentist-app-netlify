alter table if exists admin_credentials
  rename column id to workspace_key;

alter table if exists admin_credentials
  drop constraint if exists admin_credentials_pkey;

alter table if exists admin_credentials
  alter column workspace_key set default 'default';

update admin_credentials
set workspace_key = coalesce(nullif(trim(workspace_key), ''), 'default')
where workspace_key is null or trim(workspace_key) = '';

alter table if exists admin_credentials
  add constraint admin_credentials_pkey primary key (workspace_key);
