const META_DATASET_ID =
  process.env.META_DATASET_ID || "1430998185171928";

const META_GRAPH_API_VERSION =
  process.env.META_GRAPH_API_VERSION || "v23.0";

const ALLOWED_SOURCE_HOSTS = new Set([
  "app.creditisolucoes.com.br",
  "creditisolucoes.com.br",
  "www.creditisolucoes.com.br",
  "crediti-ia-site.onrender.com"
]);

function cleanString(value, maxLength = 255) {
  return String(value || "").trim().slice(0, maxLength);
}

function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return cleanString(request.ip, 80);
}

function getAllowedSourceUrl(value) {
  const sourceUrl = cleanString(value, 2048);

  if (!sourceUrl) {
    return "";
  }

  try {
    const parsed = new URL(sourceUrl);
    const localDevelopment =
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname);

    if (parsed.protocol !== "https:" && !localDevelopment) {
      return "";
    }

    if (
      !ALLOWED_SOURCE_HOSTS.has(parsed.hostname) &&
      !localDevelopment
    ) {
      return "";
    }

    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function buildUserData(request, payload) {
  const userData = {};
  const clientIp = getClientIp(request);
  const userAgent = cleanString(request.get("user-agent"), 512);
  const fbp = cleanString(payload.fbp, 255);
  const fbc = cleanString(payload.fbc, 255);

  if (clientIp) {
    userData.client_ip_address = clientIp;
  }

  if (userAgent) {
    userData.client_user_agent = userAgent;
  }

  if (/^fb\.1\.\d+\.\d+$/.test(fbp)) {
    userData.fbp = fbp;
  }

  if (/^fb\.1\.\d+\..+$/.test(fbc)) {
    userData.fbc = fbc;
  }

  return userData;
}

export function isMetaConversionsConfigured() {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN);
}

export async function sendMetaConversion(request, payload = {}) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!accessToken) {
    return { sent: false, reason: "not_configured" };
  }

  if (payload.eventName !== "Lead") {
    const error = new Error("Evento da Meta não permitido.");
    error.statusCode = 400;
    throw error;
  }

  const eventId = cleanString(payload.eventId, 100);
  const eventSourceUrl = getAllowedSourceUrl(
    payload.eventSourceUrl
  );

  if (!eventId || !eventSourceUrl) {
    const error = new Error("Dados de medição inválidos.");
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_DATASET_ID}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        data: [
          {
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            action_source: "website",
            event_source_url: eventSourceUrl,
            user_data: buildUserData(request, payload)
          }
        ]
      })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result?.error?.message || "A Meta recusou o evento."
    );
    error.statusCode = 502;
    throw error;
  }

  return {
    sent: true,
    eventsReceived: result.events_received ?? null
  };
}
