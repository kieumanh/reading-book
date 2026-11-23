const providers = new Set([
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
  "wns2-bl2p.notify.windows.com"
]);

export const weeklyCron = "0,15,30,45 12 * * *";

export function validEndpoint(endpoint) {
  if (typeof endpoint !== "string" || endpoint.length > 2048) return false;
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" && !url.port && !url.username && !url.password &&
      !url.hash && url.pathname.length > 1 &&
      (providers.has(url.hostname) || url.hostname.endsWith(".notify.windows.com") ||
        url.hostname.endsWith(".push.apple.com"));
  } catch {
    return false;
  }
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function authorization(env, origin, key, time) {
  const encode = value => base64url(new TextEncoder().encode(JSON.stringify(value)));
  const unsigned = encode({ typ: "JWT", alg: "ES256" }) + "." +
    encode({ aud: origin, exp: time + 3600, sub: "https://reading-book.huongthiennature.com/" });
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned)
  );
  return "vapid t=" + unsigned + "." + base64url(new Uint8Array(signature)) + ", k=" + env.VAPID_PUBLIC;
}

export async function sendWeekly(event, env) {
  if (event.cron !== weeklyCron || !env.VAPID_PRIVATE || !env.VAPID_PUBLIC) return;
  const time = Math.floor(event.scheduledTime / 1000);
  const local = new Date(event.scheduledTime + 7 * 3600000);
  const date = local.toISOString().slice(0, 10);
  await env.DB.prepare(
    "DELETE FROM weekly_push WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE token_hash = session_hash AND expires_at > ?)"
  ).bind(time).run();
  const { results } = await env.DB.prepare(
    "SELECT endpoint FROM weekly_push WHERE weekday = ? AND sent_on < ? ORDER BY sent_on, endpoint LIMIT 40"
  ).bind(local.getUTCDay(), date).all();
  if (!results.length) return;

  const key = await crypto.subtle.importKey("jwk", JSON.parse(env.VAPID_PRIVATE),
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const tokens = new Map();
  const changes = [];
  for (let start = 0; start < results.length; start += 5) {
    await Promise.allSettled(results.slice(start, start + 5).map(async ({ endpoint }) => {
      if (!validEndpoint(endpoint)) return;
      const origin = new URL(endpoint).origin;
      if (!tokens.has(origin)) tokens.set(origin, authorization(env, origin, key, time));
      const response = await fetch(endpoint, {
        method: "POST",
        redirect: "error",
        headers: { Authorization: await tokens.get(origin), TTL: "3600", Topic: "reading-book-weekly" },
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        changes.push(env.DB.prepare("UPDATE weekly_push SET sent_on = ? WHERE endpoint = ?").bind(date, endpoint));
      } else if ([404, 410].includes(response.status)) {
        changes.push(env.DB.prepare("DELETE FROM weekly_push WHERE endpoint = ?").bind(endpoint));
      }
    }));
  }
  if (changes.length) await env.DB.batch(changes);
}
