// netlify/functions/ghl-callback.mjs
// Handles the CRM OAuth callback and exchanges the auth code for tokens server-side.
// GHL_CLIENT_SECRET lives only here, never in the browser bundle.
//
// Set these in Netlify Dashboard → Site → Environment Variables:
//   GHL_CLIENT_ID
//   GHL_CLIENT_SECRET
//   GHL_REDIRECT_URI      (for example: https://www.smilevisionpro.ai/ghl-callback)
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY  (service role key, NOT anon key)
//   FRONTEND_URL          (e.g. https://www.smilevisionpro.ai)

import { createClient } from "@supabase/supabase-js";

const FRONTEND_BASE = process.env.FRONTEND_URL ?? "https://www.smilevisionpro.ai";

function redirect(path) {
  return {
    statusCode: 302,
    headers: { Location: `${FRONTEND_BASE}${path}` },
    body: "",
  };
}

function jsonError(status, message) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: message }),
  };
}

export const handler = async (event) => {
  // The platform redirects here as GET with ?code=XXX&state=YYY
  // We also accept POST from GHLCallbackPage.tsx as a fallback
  let code, state;

  if (event.httpMethod === "GET") {
    code  = event.queryStringParameters?.code;
    state = event.queryStringParameters?.state;
    const ghError = event.queryStringParameters?.error;
    if (ghError) {
      return redirect(`/admin/ghl-connect?error=${encodeURIComponent(ghError)}`);
    }
  } else if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body ?? "{}");
      code  = body.code;
      state = body.state;
    } catch {
      return jsonError(400, "Invalid JSON body");
    }
  } else {
    return jsonError(405, "Method not allowed");
  }

  if (!code) {
    return redirect("/admin/ghl-connect?error=missing_code");
  }

  // ── Validate env
  const clientId     = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;
  const redirectUri  = process.env.GHL_REDIRECT_URI ?? `${FRONTEND_BASE}/ghl-callback`;

  if (!clientId || !clientSecret) {
    console.error("❌ GHL_CLIENT_ID or GHL_CLIENT_SECRET not set");
    return redirect("/admin/ghl-connect?error=server_misconfiguration");
  }

  // ── Exchange code for tokens (server-side only – client_secret never leaves here)
  let tokens;
  try {
    const tokenRes = await fetch("https://services.leadconnectorhq.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        grant_type:    "authorization_code",
        code,
        redirect_uri:  redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("❌ Token exchange failed:", tokenRes.status, text);
      return redirect(`/admin/ghl-connect?error=${encodeURIComponent("token_exchange_failed")}`);
    }

    tokens = await tokenRes.json();
  } catch (err) {
    console.error("❌ Token exchange network error:", err);
    return redirect("/admin/ghl-connect?error=network_error");
  }

  const locationId = tokens.locationId ?? tokens.location_id ?? "";
  if (!locationId) {
    console.error("❌ No locationId in token response");
    return redirect("/admin/ghl-connect?error=no_location_id");
  }

  // ── Store tokens in Supabase ghl_tokens table
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 86400) * 1000).toISOString();

      const { error } = await supabase.from("ghl_tokens").upsert(
        {
          locationId,
          access_token:  tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at:    expiresAt,
          scope:         tokens.scope ?? "",
        },
        { onConflict: "locationId" }
      );

      if (error) console.error("⚠️ Supabase upsert error (non-fatal):", error);
      else console.log("✅ Token stored for locationId:", locationId);
    } catch (err) {
      console.error("⚠️ Supabase write error (non-fatal):", err);
    }
  }

  // ── Redirect to frontend with success flag (no tokens in URL)
  return redirect(`/admin/ghl-connect?success=true&locationId=${encodeURIComponent(locationId)}`);
};
