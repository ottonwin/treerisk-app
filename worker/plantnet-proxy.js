const PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all";
const ALLOWED_ORIGINS = new Set([
  "https://ottonwin.github.io",
  "http://localhost:8080",
  "http://127.0.0.1:8080"
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = buildCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (!env.PLANTNET_API_KEY) {
      return json({ error: "Plant ID backend is missing its API secret" }, 500, corsHeaders);
    }

    try {
      const formData = await request.formData();
      const upstream = await fetch(`${PLANTNET_URL}?api-key=${encodeURIComponent(env.PLANTNET_API_KEY)}`, {
        method: "POST",
        body: formData
      });

      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: {
          ...corsHeaders,
          "Content-Type": upstream.headers.get("Content-Type") || "application/json"
        }
      });
    } catch (error) {
      return json({ error: "Plant identification request failed" }, 502, corsHeaders);
    }
  }
};

function buildCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://ottonwin.github.io";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json"
    }
  });
}
