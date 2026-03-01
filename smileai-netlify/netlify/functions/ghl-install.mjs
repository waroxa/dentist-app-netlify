// netlify/functions/ghl-install.mjs
// GHL Marketplace install webhook – called by GHL when a user installs the app.
// MUST return 200 immediately – GHL will retry if it gets anything else.
//
// In GHL Marketplace Dashboard set "App Webhook URL" to:
//   https://www.smilevisionpro.ai/.netlify/functions/ghl-install

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  // Must always return 200 – log errors but never fail the response
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    console.warn("⚠️ ghl-install: non-JSON body");
  }

  console.log("📦 GHL install webhook:", JSON.stringify(payload));

  const locationId = payload.locationId ?? payload.location_id ?? "";
  const agencyId   = payload.agencyId   ?? payload.agency_id   ?? "";

  if (locationId) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from("ghl_installs").upsert(
          {
            locationId,
            agencyId: agencyId || null,
            installed_at: new Date().toISOString(),
            raw_payload: payload,
          },
          { onConflict: "locationId" }
        );
        console.log("✅ Install recorded for locationId:", locationId);
      } catch (err) {
        // Log but never let DB errors prevent the 200 response
        console.error("⚠️ Failed to record install (non-fatal):", err);
      }
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true }),
  };
};
