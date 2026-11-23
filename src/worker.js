import { sendWeekly, validEndpoint } from "./weekly.js";
import { journeyProgress, MAX_READING_LEVEL } from "../public/journey-score.js";

const SESSION_AGE = 60 * 60 * 24 * 30;
const SESSION_COOKIE = "__Host-readingbook";
const MAX_ENTRIES = 300;
const encoder = new TextEncoder();

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default {
  scheduled: sendWeekly,
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      return await route(request, url, env);
    } catch (error) {
      if (error instanceof RequestError) return json({ error: error.message }, error.status);
      console.error(error.name, request.method, url.pathname.split("/").slice(0, 3).join("/"));
      return json({ error: "Hệ thống đang bận. Vui lòng thử lại." }, 503);
    }
  }
};

async function route(request, url, env) {
  const db = env.DB;
  const { method } = request;
  const path = url.pathname;

  if (method !== "GET" && request.headers.get("Origin") !== url.origin) {
    throw new RequestError(403, "Yêu cầu cần được gửi từ Reading Book.");
  }

  if (path === "/api/health" && method === "GET") {
    await db.prepare("SELECT 1").first();
    return json({ version: "1.2.0", status: "ok" });
  }
  if ((path === "/api/register" || path === "/api/login") && method === "POST") {
    return authenticate(request, db, path === "/api/register");
  }

  const sessionHash = await getSessionHash(request);
  if (path === "/api/logout" && method === "POST") {
    if (sessionHash) await db.batch([
      db.prepare("DELETE FROM weekly_push WHERE session_hash = ?").bind(sessionHash),
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(sessionHash)
    ]);
    return json({ ok: true }, 200, sessionCookie("", 0));
  }

  const reader = sessionHash && await db.prepare(
    "SELECT r.id, r.username, r.profile, r.role FROM sessions s JOIN readers r ON r.id = s.reader_id WHERE s.token_hash = ? AND s.expires_at > ?"
  ).bind(sessionHash, now()).first();

  if (path === "/api/session" && method === "GET") {
    return json(reader ? { user: publicProfile(reader) } : { user: null });
  }
  if (!reader) throw new RequestError(401, "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");

  if (path === "/api/weekly") {
    if (method === "GET") {
      const row = await db.prepare("SELECT weekday FROM weekly_push WHERE session_hash = ?").bind(sessionHash).first();
      return json({ weekday: row?.weekday ?? publicProfile(reader).weeklyDay ?? null, key: env.VAPID_PUBLIC || "" });
    }
    if (method === "PUT") {
      const { endpoint, weekday } = await readJson(request, 4096);
      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        throw new RequestError(400, "Ngày gửi không hợp lệ.");
      }
      const saveDay = db.prepare("UPDATE readers SET profile = json_set(profile, '$.weeklyDay', ?) WHERE id = ?").bind(weekday, reader.id);
      const changeDeviceDays = db.prepare(
        "UPDATE weekly_push SET weekday = ? WHERE session_hash IN (SELECT token_hash FROM sessions WHERE reader_id = ?)"
      ).bind(weekday, reader.id);
      if (endpoint == null) {
        await db.batch([saveDay, changeDeviceDays]);
        return json({ weekday });
      }
      if (!env.VAPID_PUBLIC || !validEndpoint(endpoint)) {
        throw new RequestError(400, "Đăng ký thông báo trình duyệt không hợp lệ.");
      }
      await db.batch([
        saveDay,
        changeDeviceDays,
        db.prepare("DELETE FROM weekly_push WHERE session_hash = ? AND endpoint != ?").bind(sessionHash, endpoint),
        db.prepare(
          `INSERT INTO weekly_push (endpoint, session_hash, weekday) VALUES (?, ?, ?)
           ON CONFLICT (endpoint) DO UPDATE SET session_hash = excluded.session_hash, weekday = excluded.weekday`
        ).bind(endpoint, sessionHash, weekday)
      ]);
      return json({ weekday });
    }
    if (method === "DELETE") {
      await db.batch([
        db.prepare("DELETE FROM weekly_push WHERE session_hash IN (SELECT token_hash FROM sessions WHERE reader_id = ?)").bind(reader.id),
        db.prepare("UPDATE readers SET profile = json_remove(profile, '$.weeklyDay') WHERE id = ?").bind(reader.id)
      ]);
      return json({ weekday: null });
    }
  }

  if (path === "/api/library" && method === "GET") {
    const [items, progress] = await db.batch([
      db.prepare("SELECT payload FROM entries WHERE reader_id = ? ORDER BY updated_at DESC, id").bind(reader.id),
      journeyQuery(db, reader.id)
    ]);
    return json({ items: items.results.map(row => JSON.parse(row.payload)), journey: progress.results[0] });
  }
  if (path === "/api/journey/seen" && method === "PUT") {
    const { level } = await readJson(request, 256);
    if (!Number.isInteger(level) || level < 1 || level > MAX_READING_LEVEL) {
      throw new RequestError(400, "Cấp độ không hợp lệ.");
    }
    const progress = await journeyQuery(db, reader.id).first();
    if (level > journeyProgress(progress).level) {
      throw new RequestError(400, "Huy hiệu này chưa được mở.");
    }
    const saved = await db.prepare(
      `INSERT INTO reading_awards_seen (reader_id, level) VALUES (?, ?)
       ON CONFLICT (reader_id) DO UPDATE SET level = max(level, excluded.level)
       RETURNING level`
    ).bind(reader.id, level).first();
    return json({ seen: saved.level });
  }
  if (path === "/api/profile" && method === "PUT") {
    const body = await readJson(request, 185000);
    const profile = profileFrom(body);
    const updated = await db.prepare(
      "UPDATE readers SET profile = json_patch(profile, ?) WHERE id = ? RETURNING profile"
    ).bind(JSON.stringify(profile), reader.id).first();
    return json({ user: publicProfile({ ...reader, profile: updated.profile }) });
  }
  const entryId = path.match(/^\/api\/library\/([a-z0-9-]{1,64})$/)?.[1];
  if (entryId && method === "PUT") {
    const item = entryFrom(await readJson(request, 185000), entryId);
    const [saved, progress] = await db.batch([
      db.prepare(
        `INSERT INTO entries (reader_id, id, updated_at, payload)
         SELECT ?1, ?2, ?3, ?4
         WHERE EXISTS (SELECT 1 FROM entries WHERE reader_id = ?1 AND id = ?2)
           OR (SELECT COUNT(*) FROM entries WHERE reader_id = ?1) < ?5
         ON CONFLICT (reader_id, id) DO UPDATE SET updated_at = excluded.updated_at, payload = excluded.payload`
      ).bind(reader.id, entryId, item.updated, JSON.stringify(item), MAX_ENTRIES),
      journeyQuery(db, reader.id)
    ]);
    if (!saved.meta.changes) throw new RequestError(409, "Thư viện đã đạt giới hạn 300 mục.");
    return json({ item, journey: progress.results[0] });
  }
  if (entryId && method === "DELETE") {
    await db.prepare("DELETE FROM entries WHERE reader_id = ? AND id = ?").bind(reader.id, entryId).run();
    return json({ ok: true });
  }

  throw new RequestError(404, "Yêu cầu không tồn tại.");
}

function journeyQuery(db, readerId) {
  return db.prepare(
    `SELECT CAST(coalesce(sum(chapters), 0) AS TEXT) AS chapters,
            CAST(coalesce(sum(completed), 0) AS TEXT) AS books,
            coalesce((SELECT level FROM reading_awards_seen WHERE reader_id = ?1), 0) AS seen
     FROM reading_credit WHERE reader_id = ?1`
  ).bind(readerId);
}

async function authenticate(request, db, registering) {
  const body = await readJson(request, 4096);
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = username.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(username);
  const legacy = !registering && /^[a-z0-9][a-z0-9_.-]{2,29}$/.test(username);
  const password = typeof body.password === "string" ? body.password : "";
  if ((!email && !legacy) || password.length < 10 || password.length > 128) {
    throw new RequestError(400, "Kiểm tra email hoặc tên đăng nhập và mật khẩu từ 10 đến 128 ký tự.");
  }

  await limitAuth(db, request.headers.get("CF-Connecting-IP") || "local", username, registering);
  if (registering && body.confirmPassword !== password) throw new RequestError(400, "Mật khẩu xác nhận chưa khớp.");
  let reader;
  if (registering) {
    const profile = profileFrom({ name: field(body.name, 60) || username });
    const salt = randomHex(16);
    reader = { id: crypto.randomUUID(), username, profile: JSON.stringify(profile) };
    const passwordHash = await derive(password, salt);
    const { meta } = await db.prepare(
      "INSERT INTO readers (id, username, salt, password_hash, profile) VALUES (?, ?, ?, ?, ?) ON CONFLICT (username) DO NOTHING"
    ).bind(reader.id, username, salt, passwordHash, reader.profile).run();
    if (!meta.changes) throw new RequestError(409, "Email này đã được sử dụng.");
  } else {
    reader = await db.prepare("SELECT * FROM readers WHERE username = ?").bind(username).first();
    const attempted = await derive(password, reader?.salt || "0".repeat(32));
    if (!reader || !equalHash(attempted, reader.password_hash)) {
      throw new RequestError(401, "Email, tên đăng nhập hoặc mật khẩu chưa đúng.");
    }
  }

  const oldSession = await getSessionHash(request);
  const token = randomHex(32);
  const queries = [
    db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now()),
    db.prepare("INSERT INTO sessions (token_hash, reader_id, expires_at) VALUES (?, ?, ?)")
      .bind(await hash(token), reader.id, now() + SESSION_AGE)
  ];
  if (oldSession) queries.push(db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(oldSession));
  await db.batch(queries);
  return json({ user: publicProfile(reader) }, registering ? 201 : 200, sessionCookie(token, SESSION_AGE));
}

async function limitAuth(db, ip, username, registering) {
  const time = now();
  const mode = registering ? "register" : "login";
  const keys = await Promise.all([hash(mode + ":ip:" + ip), hash(mode + ":user:" + username)]);
  const limits = registering ? [12, 8] : [40, 16];
  const counts = await db.batch([
    db.prepare("DELETE FROM auth_attempts WHERE expires_at <= ?").bind(time),
    ...keys.map(key => db.prepare(
      `INSERT INTO auth_attempts (id, attempts, expires_at) VALUES (?, 1, ?)
       ON CONFLICT (id) DO UPDATE SET attempts = attempts + 1
       RETURNING attempts`
    ).bind(key, time + 900))
  ]);
  if (limits.some((limit, i) => counts[i + 1].results[0].attempts > limit)) {
    throw new RequestError(429, "Đã có nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.");
  }
}

function profileFrom(body) {
  return {
    name: field(body.name, 60) || "Bạn đọc",
    avatar: imageFrom(body.avatar),
    theme: ["auto", "light", "dark"].includes(body.theme) ? body.theme : "auto",
    reminders: body.reminders !== false,
    fireworks: body.fireworks !== false
  };
}

function entryFrom(body, id) {
  const title = field(body.title, 120);
  const author = field(body.author, 100);
  const category = field(body.category, 60);
  const total = Number(body.total);
  const done = Number(body.done);
  if (!title || !author || !["book", "podcast"].includes(body.type) ||
      !Number.isInteger(total) || total < 1 || total > 9999 ||
      !Number.isInteger(done) || done < 0 || done > total) {
    throw new RequestError(400, "Kiểm tra tên, tác giả và số chương hoặc tập.");
  }

  return {
    id, title, author, category, total, done,
    type: body.type,
    summary: field(body.summary, 2000),
    checkpoint: field(body.checkpoint, 240),
    cover: imageFrom(body.cover),
    link: safeLink(body.link),
    starred: body.starred === true,
    updated: Date.now()
  };
}

function safeLink(value) {
  if (!value) return "";
  try {
    const url = new URL(field(value, 600));
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {
    // Invalid links cannot be opened by the reader.
  }
  throw new RequestError(400, "Liên kết cần là địa chỉ web hợp lệ.");
}

function imageFrom(value) {
  if (!value) return "";
  if (typeof value !== "string" || value.length > 180000 ||
      !/^data:image\/jpeg;base64,[a-zA-Z0-9+/]+={0,2}$/.test(value) ||
      !value.startsWith("data:image/jpeg;base64,/9j/")) {
    throw new RequestError(400, "Ảnh không hợp lệ hoặc vượt kích thước.");
  }
  return value;
}

function field(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

async function readJson(request, limit) {
  if (request.headers.get("Content-Type")?.split(";")[0] !== "application/json" || !request.body) {
    throw new RequestError(400, "Dữ liệu không hợp lệ.");
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new RequestError(413, "Dữ liệu vượt giới hạn kích thước.");
    }
    raw += decoder.decode(value, { stream: true });
  }
  try {
    const result = JSON.parse(raw + decoder.decode());
    if (result && typeof result === "object" && !Array.isArray(result)) return result;
  } catch {
    // Use the same message for malformed JSON and non-object values.
  }
  throw new RequestError(400, "Dữ liệu không hợp lệ.");
}

function json(data, status = 200, cookie) {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (cookie) headers["Set-Cookie"] = cookie;
  return Response.json(data, { status, headers });
}

function publicProfile(reader) {
  return { ...JSON.parse(reader.profile), username: reader.username, role: reader.role || "reader" };
}

function sessionCookie(token, age) {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Lax`;
}

function getSessionHash(request) {
  const cookies = request.headers.get("Cookie") || "";
  const token = cookies.split(";").map(value => value.trim()).find(value => value.startsWith(SESSION_COOKIE + "="))?.slice(SESSION_COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(token || "") ? hash(token) : null;
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function hex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(size) {
  return hex(crypto.getRandomValues(new Uint8Array(size)));
}

async function hash(value) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

async function derive(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const result = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256
  );
  return hex(new Uint8Array(result));
}

function equalHash(left, right) {
  let difference = left.length ^ right.length;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}
