// netlify/functions/ghl-refresh.mjs
// Refreshes a platform access token using the stored refresh_token.
// Called by the admin panel when token is near expiry.
//
// POST body: { locationId: string }
// Returns:   { success: true, expires_at: string }

import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function json(status, body) {
  return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let locationId;
  try {
    locationId = JSON.parse(event.body ?? "{}").locationId;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  if (!locationId) return json(400, { error: "Missing locationId" });

  const clientId     = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;
  const supabaseUrl  = process.env.SUPABASE_URL;
  const supabaseKey  = process.env.SUPABASE_SERVICE_KEY;

  if (!clientId || !clientSecret) {
    return json(500, { error: "Server misconfiguration: missing platform credentials" });
  }
  if (!supabaseUrl || !supabaseKey) {
    return json(500, { error: "Server misconfiguration: missing Supabase credentials" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch stored refresh token
  const { data: row, error: fetchErr } = await supabase
    .from("ghl_tokens")
    .select("refresh_token")
    .eq("locationId", locationId)
    .single();

  if (fetchErr || !row) {
    return json(404, { error: "Location not connected or token not found" });
  }

  // Call the platform refresh endpoint
  let tokens;
  try {
    const res = await fetch("https://services.leadconnectorhq.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        grant_type:    "refresh_token",
        refresh_token: row.refresh_token,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Token refresh failed:", res.status, text);
      return json(res.status, { error: "Token refresh failed", details: text });
    }

    tokens = await res.json();
  } catch (err) {
    console.error("❌ Token refresh network error:", err);
    return json(502, { error: "Network error during token refresh" });
  }

  const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 86400) * 1000).toISOString();

  const { error: updateErr } = await supabase
    .from("ghl_tokens")
    .update({
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? row.refresh_token,
      expires_at:    expiresAt,
    })
    .eq("locationId", locationId);

  if (updateErr) {
    console.error("❌ Supabase update error:", updateErr);
    return json(500, { error: "Failed to persist refreshed token" });
  }

  console.log("✅ Token refreshed for locationId:", locationId);
  return json(200, { success: true, expires_at: expiresAt });
};
