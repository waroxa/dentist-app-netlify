# 🚀 SmileAI – Netlify + CRM Marketplace Deployment Guide
# Get approved TODAY – follow these steps in order

---

## WHAT CHANGED (minimal, surgical)

| File | What |
|------|------|
| `netlify/functions/ghl-callback.mjs` | NEW – secure token exchange (client_secret server-only) |
| `netlify/functions/ghl-refresh.mjs`  | NEW – token refresh via server |
| `netlify/functions/ghl-install.mjs`  | NEW – CRM install webhook handler |
| `netlify.toml`                        | NEW – build config + URL routing |
| `src/pages/GHLCallbackPage.tsx`       | NEW – browser landing at /ghl-callback |
| `src/App.tsx`                         | +2 lines: import + /ghl-callback route |
| `src/components/admin/GHLOAuthConnect.tsx` | API object refactored: refresh → /api/ghl-refresh |
| `supabase/migrations/001_ghl_marketplace_tables.sql` | NEW – creates ghl_tokens + ghl_installs |
| `package.json`                        | Added @supabase/supabase-js |
| `.env.example`                        | Documents which vars go where |

Homepage, UI, Tailwind, Shadcn, AI logic – ALL UNCHANGED.

---

## STEP 1 — Run the Supabase SQL migration (2 minutes)

1. Go to https://supabase.com/dashboard → your project
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase/migrations/001_ghl_marketplace_tables.sql`
4. Click **Run**
5. You should see: `Success. No rows returned`

This creates the `ghl_tokens` and `ghl_installs` tables with proper security (only your server functions can access them).

---

## STEP 2 — Get your Supabase Service Role Key (1 minute)

You need this for the Netlify functions to write tokens to Supabase.

1. Supabase Dashboard → your project → **Settings** → **API**
2. Under "Project API keys", copy the **service_role** key (the long one that says "secret")
   ⚠️ This is NOT the same as the anon key already in your code
3. Keep it handy for Step 4

---

## STEP 3 — Deploy to Netlify (5 minutes)

### Option A: Connect GitHub (recommended – auto-deploys on push)
1. Go to https://app.netlify.com → **Add new site** → **Import an existing project**
2. Choose **GitHub** → select your `Smileai` repo
3. Build settings (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `build`
4. Click **Deploy site** (it will fail on first deploy – that's OK, you need env vars first)
5. Note your Netlify URL: `https://something-random.netlify.app`

### Option B: Drag & drop (fastest for today)
1. Run locally: `npm i && npm run build`
2. Go to https://app.netlify.com → **Add new site** → **Deploy manually**
3. Drag the `build/` folder onto the page
4. Note your Netlify URL

### Set your custom domain (optional but recommended for CRM approval)
- Netlify → Site settings → Domain management → Add custom domain
- Point `www.smilevisionpro.ai` to Netlify (add CNAME in your DNS)

---

## STEP 4 — Set Environment Variables in Netlify (3 minutes)

1. Netlify Dashboard → your site → **Site configuration** → **Environment variables**
2. Click **Add a variable** for each one below:

### Variables to add:

| Key | Value |
|-----|-------|
| `GHL_CLIENT_ID` | Your CRM app client_id (from CRM Developer portal) |
| `GHL_CLIENT_SECRET` | Your CRM app client_secret ← **never put this in code** |
| `GHL_REDIRECT_URI` | `https://www.smilevisionpro.ai/ghl-callback` |
| `FRONTEND_URL` | `https://www.smilevisionpro.ai` |
| `SUPABASE_URL` | `https://pvophjpndtqxkoygposy.supabase.co` |
| `SUPABASE_SERVICE_KEY` | The service role key from Step 2 |
| `VITE_GOOGLE_GENAI_API_KEY` | Your existing Google AI key |
| `VITE_GHL_CLIENT_ID` | Same as GHL_CLIENT_ID (safe to expose in frontend) |

3. After adding all variables → **Trigger deploy** (Deploys → Trigger deploy → Deploy site)

---

## STEP 5 — Configure CRM Marketplace Dashboard (5 minutes)

Go to https://marketplace.gohighlevel.com → your app → **App Settings**

Set these fields EXACTLY:

| Setting | Value |
|---------|-------|
| **Redirect URI / OAuth Callback URL** | `https://www.smilevisionpro.ai/ghl-callback` |
| **App Webhook URL** (Install webhook) | `https://www.smilevisionpro.ai/.netlify/functions/ghl-install` |
| **App URL** (iframe entry point) | `https://www.smilevisionpro.ai/marketplace` |
| **Privacy Policy URL** | `https://www.smilevisionpro.ai/privacy` |
| **Terms of Service URL** | `https://www.smilevisionpro.ai/terms` |

### Scopes to request (minimal – only what you use):
```
contacts.readonly
contacts.write
locations.readonly
locations/customFields.readonly
locations/customFields.write
forms.readonly
forms.write
```

⚠️ The Redirect URI must match EXACTLY – same domain, path, no trailing slash.

---

## STEP 6 — Test the OAuth Flow (5 minutes)

### Test 1: Install webhook
```bash
curl -X POST https://www.smilevisionpro.ai/.netlify/functions/ghl-install \
  -H "Content-Type: application/json" \
  -d '{"locationId":"test123","agencyId":"agency456"}'
```
Expected: `{"success":true}`

### Test 2: Full OAuth connect
1. Go to `https://www.smilevisionpro.ai/admin/ghl-connect`
2. Click **Connect CRM platform**
3. You should be redirected to CRM's authorization page
4. Authorize the app
5. CRM redirects to `https://www.smilevisionpro.ai/ghl-callback`
6. You'll briefly see the "Connecting to CRM platform…" spinner
7. Then redirect to `/admin/ghl-connect?success=true`
8. Your location should appear in the "Connected Locations" list

### Test 3: Verify token was stored
1. Supabase Dashboard → Table Editor → `ghl_tokens`
2. You should see a row with your locationId

### Test 4: Privacy and Terms pages
- Visit `https://www.smilevisionpro.ai/privacy` → should load Privacy page
- Visit `https://www.smilevisionpro.ai/terms` → should load Terms page

### Test 5: Marketplace iframe
- Visit `https://www.smilevisionpro.ai/marketplace` → should load the embedded app

---

## STEP 7 — Submit for CRM Marketplace Approval

CRM's checklist for approval:
- ✅ `client_secret` server-side only (Netlify function env var)
- ✅ OAuth redirect URI matches exactly in code and dashboard
- ✅ Install webhook returns 200 OK
- ✅ `/privacy` route exists with real content
- ✅ `/terms` route exists with real content
- ✅ Minimal scopes requested
- ✅ Tokens stored server-side (Supabase, RLS enabled)
- ✅ HTTPS everywhere

---

## TROUBLESHOOTING

### "Connection Failed" on /ghl-callback
- Check Netlify logs: Site → Functions → ghl-callback → View logs
- Most likely: `GHL_REDIRECT_URI` in Netlify doesn't match exactly what's set in CRM dashboard

### Functions not found (404)
- Check netlify.toml is in the repo root
- Make sure `netlify/functions/` folder exists with .mjs files

### Token exchange fails (401 from CRM)
- Double-check `GHL_CLIENT_SECRET` in Netlify env vars
- Make sure `GHL_REDIRECT_URI` matches EXACTLY what's registered in CRM

### Netlify build fails
- Check build log for errors
- Make sure `@supabase/supabase-js` is in package.json (it is in this zip)

---

## WHY NETLIFY OVER VERCEL FOR THIS?

- Netlify Functions work as CommonJS/ESM without any config – simpler for CRM's redirect flow
- The `netlify.toml` redirects let CRM hit `/ghl-callback` directly (no path gymnastics)
- Free tier includes 125k function invocations/month – plenty for OAuth flows
- Deploy preview URLs are great for testing before going live
