# SmileVisionPro Marketplace Setup

## Required Environment Variables

Set these in Netlify before testing or publishing the marketplace app:

- `GHL_CLIENT_ID`
- `GHL_CLIENT_SECRET`
- `GHL_REDIRECT_URI`
- `GHL_SCOPES` - optional; defaults to `contacts.readonly contacts.write locations.readonly`
- `PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `TOKEN_ENCRYPTION_KEY` - 32-byte base64 or 64-character hex
- `SMILEVISION_ADMIN_SESSION_SECRET`
- `SMILEVISION_ADMIN_SETUP_SECRET`

## Marketplace Listing Config

Use these URLs in the marketplace listing:

- Install/Redirect URL: `${PUBLIC_APP_URL}/api/oauth/start`
- OAuth Redirect URI: `${PUBLIC_APP_URL}/api/oauth/callback`
- Webhook URL: `${PUBLIC_APP_URL}/api/ghl-webhook`

## OAuth Scopes

Default scopes:

- `contacts.readonly` - used to read CRM contact records when syncing generated smile assets back to an existing contact.
- `contacts.write` - used to create or update contacts, write custom field values, and add contact notes with preview/video asset links.
- `locations.readonly` - used by the marketplace authorization flow to identify the selected sub-account location.

All CRM API calls are made from Netlify functions. The browser never stores marketplace API keys, access tokens, or refresh tokens.

## First-Time Admin Setup

There is no default admin password. On first use, the admin setup flow requires an activation secret:

1. Visit the admin area for the target workspace.
2. Submit the activation code from `SMILEVISION_ADMIN_SETUP_SECRET`.
3. Set a new staff password through the activation completion flow.
4. Sign in with the password you created.

For non-default workspaces, setup is allowed only after the marketplace install creates an active OAuth connection for that location.
