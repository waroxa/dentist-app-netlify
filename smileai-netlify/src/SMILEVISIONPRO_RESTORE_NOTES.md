# SmileVisionPro restore notes

## Root causes fixed
- Lead submit completed successfully, but the frontend only swapped a local boolean and did not present a strong guided transition into the upload and generation steps.
- Gemini generation expected `GEMINI_API_KEY`, while the deployment stored `GOOGLE_GEMINI_API_KEY`, so image requests could fail before reaching Gemini.
- The FAL video path was sending the generated preview as an inline data URL even though provider integrations are more reliable with a public asset URL.
- The Veo path could return inline video bytes or a cloud storage URI, but the previous flow did not normalize the result into a browser-friendly public MP4 URL for consistent playback.
- The “real results” section built its public video URL from `REDACTED_PROJECT_ID`, so the UI pointed to the wrong Supabase project even though the intended public asset URLs existed.

## Environment variables and usage
- `GOOGLE_GEMINI_API_KEY`: accepted as the deployment secret for Gemini image generation and mapped as a compatibility alias for `GEMINI_API_KEY` in the backend helper.
- `GEMINI_API_KEY`: canonical backend lookup for Gemini requests after compatibility mapping.
- `GEMINI_IMAGE_MODEL`: optional model override for Gemini smile preview generation.
- `FAL_API_KEY`: authenticates the FAL image-to-video request.
- `FAL_VIDEO_MODEL`: selects the FAL video model endpoint.
- `GOOGLE_CLOUD_PROJECT_ID`: identifies the Vertex AI project for Veo.
- `GOOGLE_CLOUD_LOCATION`: sets the Vertex AI region for Veo, defaulting to `us-central1`.
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: service account JSON used to mint the Veo access token server-side.
- `VEO_MODEL`: selects the Google Veo model.
- `SUPABASE_URL`: used for database access and storage uploads.
- `SUPABASE_SERVICE_KEY`: used for privileged database access and storage uploads.
- `SMILEVISION_STORAGE_BUCKET`: optional storage bucket for generated previews, provider inputs, and normalized Veo outputs. Defaults to `smilevision-assets`.
- `PUBLIC_APP_URL`: recommended for deployment documentation and future callback/reporting links.

## QA checklist
- Submit lead and confirm the UI advances into the upload/generation workspace.
- Upload a JPG/PNG/WEBP image and generate a Gemini preview.
- Verify the generated preview renders in the Gemini result card and stores a reusable asset URL.
- Generate a FAL video from the preview image.
- Generate a Veo video from the same preview image.
- Confirm both provider cards can be compared side by side.
- Confirm the public routes `/getting-started` and `/setup-guide` remain accessible.
- Confirm the real-results section references the actual public Supabase MP4 URLs.
