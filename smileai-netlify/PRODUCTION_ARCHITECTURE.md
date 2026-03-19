# SmileVisionPro AI production architecture

## Public routes
- `/`
- `/privacy`
- `/terms`
- `/support`
- `/getting-started`
- `/setup-guide`

## Private routes
- `/admin`
- `/admin/integrations`
- `/api/admin/login`
- `/api/admin/session`
- `/api/admin/logout`
- `/api/lead-submit`
- `/api/smile-preview`
- `/api/video-create`
- `/api/video-status`
- `/api/oauth/start`
- `/api/oauth/callback`
- `/api/oauth/status`
- `/api/oauth/disconnect`
- `/api/ghl-refresh`

## Workflow summary
1. Public visitor submits lead details to `lead-submit`.
2. Backend validates, stores, and optionally syncs the lead to the connected CRM.
3. Public visitor uploads a photo and requests `smile-preview`.
4. Backend validates the image, creates a job record, calls Gemini server-side, and stores the result.
5. Public visitor can request `video-create`.
6. Backend creates a traceable job record, records the selected provider/model, and calls the requested video provider (FAL or Veo).
7. Private staff open `/admin`, authenticate through an HTTP-only session cookie, and manage integrations through backend OAuth routes.

## Environment variables
- `PUBLIC_APP_URL`: canonical site URL used for redirects.
- `SUPABASE_URL`: Supabase project URL for data storage.
- `SUPABASE_SERVICE_KEY`: service role key used only in Netlify functions.
- `SMILEVISION_ADMIN_PASSWORD`: private admin password for staff access.
- `SMILEVISION_ADMIN_SESSION_SECRET`: signing secret for HTTP-only admin sessions.
- `TOKEN_ENCRYPTION_KEY`: 32-byte AES key used to encrypt stored OAuth tokens.
- `GEMINI_API_KEY`: server-side image generation key.
- `GEMINI_IMAGE_MODEL`: optional override for the image model.
- `GHL_CLIENT_ID`: CRM OAuth client id.
- `GHL_CLIENT_SECRET`: CRM OAuth client secret.
- `GHL_REDIRECT_URI`: callback URL, typically `https://your-domain/api/oauth/callback`.
- `GHL_SCOPES`: optional OAuth scopes override.
- `VIDEO_PROVIDER_DEFAULT`: optional default video provider (`fal` or `veo`).
- `FAL_ENABLED`: optional flag to enable/disable FAL.
- `FAL_API_KEY`: FAL API key for real rendered video generation.
- `FAL_VIDEO_MODEL`: optional FAL model identifier.
- `VEO_ENABLED`: optional flag to enable/disable Veo.
- `GOOGLE_CLOUD_PROJECT_ID`: Google Cloud project ID for Vertex AI Veo.
- `GOOGLE_CLOUD_LOCATION`: Vertex AI region, typically `us-central1`.
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: service-account JSON stored server-side for Vertex AI auth.
- `VEO_MODEL`: optional Veo model identifier, default `veo-3.1-generate-001`.
- `VEO_FAST_MODEL`: optional secondary Veo fast model identifier.

## Security review summary
- Removed hard-coded provider keys and anon tokens from the frontend.
- Replaced client-stored admin auth with backend session cookies.
- Moved lead creation, AI generation, video requests, and OAuth token handling behind server routes.
- Added AES-GCM encryption helpers for persisted OAuth tokens.
- Added audit logging hooks for login, lead, preview, video, and integration events.
- Redirected legacy public marketplace/OAuth routes away from the public site.

## Deployment checklist
- Add all required environment variables in Netlify.
- Create the Supabase tables from `supabase/migrations/20260319_smilevision_backend.sql`.
- The `smile_jobs` table is the production contract: Gemini preview data stays in `output_image_data_url`, video URLs stay in `output_asset_url`, failures stay in `error_message`, provider names stay in `provider`, provider model IDs stay in `model`, and extra request details stay in `metadata`.
- The migration is idempotent and reconciles older deployments by adding `provider`, `model`, and `metadata`, copying any legacy `provider_model` values into `model`, and then removing `provider_model` so production matches the deployed code.
- Set `PUBLIC_APP_URL` to the live canonical domain.
- Confirm `GHL_REDIRECT_URI` matches `/api/oauth/callback` exactly.
- Rotate any previously exposed provider keys before redeploying.
- Run a production smoke test: lead submit, preview generation, admin login, OAuth connect, OAuth refresh.

## Marketplace readiness checklist
- Public docs exist at `/getting-started` and `/setup-guide`.
- Public site is branded as SmileVisionPro AI only.
- Legacy public marketplace pages redirect away.
- Admin integration controls are private.
- Tokens and secrets remain server-side.
- Lead, smile preview, and video workflows are backend mediated.
- The public UI keeps the original before/after + style selection + provider-based video flow while secrets remain server-side.
