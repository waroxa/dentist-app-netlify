# Admin Access Setup

Private staff access now supports a secure first-time activation flow without changing the public homepage.

## Persistent password storage

- The first staff password is stored in the `admin_credentials` table in Supabase.
- The password is never stored in plaintext.
- Netlify functions hash the password with Node `scrypt` before saving it to `admin_credentials.password_hash`.
- Passwords are now stored per workspace/install using `admin_credentials.workspace_key`.

## First-time activation requirements

- If no saved password exists, `/api/admin/status` reports setup mode.
- An authorized admin must provide a workspace activation code through the private activation flow.
- The setup secret is validated only on the backend and is never exposed to the client bundle.
- After authorization, the server issues a short-lived HTTP-only setup cookie so the password can be created securely.

## Workspace activation code

- Standalone/default workspace:
  - `SMILEVISION_ADMIN_SETUP_SECRET`
- Installed workspace with a detected `location_id` / `locationId`:
  - `{workspaceKey}:{SMILEVISION_ADMIN_SETUP_SECRET}`
- Example:
  - `abc123:my-private-setup-secret`

## Initialization order

1. Run the Supabase migrations `supabase/migrations/20260322_admin_credentials.sql` and `supabase/migrations/20260322_admin_credentials_workspace.sql`.
2. Set `SMILEVISION_ADMIN_SESSION_SECRET` for signed admin sessions.
3. Set `SMILEVISION_ADMIN_SETUP_SECRET` for first-time activation.
4. Open `/admin` for the target workspace and complete the activation flow to create that workspace's saved password.

## Backward compatibility

- If `SMILEVISION_ADMIN_PASSWORD` is still present, normal login continues to work.
- Once a password is created for a workspace in `admin_credentials`, the saved hashed password becomes the primary login source for that workspace.
