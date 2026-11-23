// Cloudflare Worker „sziget": die einzige Tür zu den geteilten Daten.
// - Zugang nur mit dem gemeinsamen Code (Secret GROUP_CODE).
// - Wer den Code richtig eingibt, bekommt einen Ausweis (Token), den das Handy aufhebt.
//   Der Ausweis gilt auch offline weiter; ändert man den Code, sind alle alten Ausweise ungültig.
// - Namen, Markierungen usw. liegen nur hier in der Datenbank, nie im öffentlichen Repository.
// Hier im Code steht nichts Geheimes.

const TOKEN_DAYS = 400; // Ausweis gilt gut ein Jahr (bis nach dem Festival)
const MAX_ACTS = 600;   // Bremse gegen versehentliches Massen-Eintragen
const LEVELS = ['muss', 'gern', 'egal'];
const FESTIVAL_DAYS = ['2027-08-10', '2027-08-11', '2027-08-12', '2027-08-13', '2027-08-14'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Person',
          Vary: 'Origin',
        }
      : {};
    const reply = (status, body) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors },
      });

    if (url.pathname === '/api/health') return reply(200, { ok: true, code: Boolean(env.GROUP_CODE) });
    if (!cors['Access-Control-Allow-Origin']) return reply(403, { error: 'Herkunft nicht erlaubt' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Max-Age': '86400' } });
    if (!env.GROUP_CODE) return reply(503, { error: 'Der gemeinsame Code ist noch nicht eingerichtet.' });

    try {
      // ---------- Anmelden ----------
      if (url.pathname === '/api/login' && request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'lokal';
        if (env.LOGIN_LIMITER) {
          const { success } = await env.LOGIN_LIMITER.limit({ key: ip });
          if (!success) return reply(429, { error: 'Zu viele Versuche. Bitte eine Minute warten.' });
        }
        const body = await request.json().catch(() => ({}));
        const code = normCode(body.code);
        if (!code || !(await sameText(code, normCode(env.GROUP_CODE)))) return reply(401, { error: 'Der Code stimmt nicht.' });
        const token = await makeToken(env, { iat: Date.now(), dev: String(body.device || '').slice(0, 40) });
        return reply(200, { token });
      }

      // ---------- Ab hier nur mit gültigem Ausweis ----------
      const auth = await checkToken(env, request.headers.get('Authorization'));
      if (!auth) return reply(401, { error: 'Bitte neu anmelden.' });

      const db = env.DB;
      const all = async (sql, ...args) => (await db.prepare(sql).bind(...args).all()).results;

      const path = url.pathname;
      const method = request.method;

      if (path === '/api/people' && method === 'GET') {
        return reply(200, {
          couples: await all('SELECT id, name, sort FROM couples ORDER BY sort'),
          persons: await all('SELECT id, name, couple_id AS couple, sort, stay FROM persons ORDER BY sort'),
        });
      }

      // Wer bin ich? (Name aus der Auswahl; reicht unter sechs Freunden)
      const me = await db.prepare('SELECT id, name FROM persons WHERE id = ?').bind(request.headers.get('X-Person') || '').first();
      if (!me) return reply(400, { error: 'Bitte zuerst deinen Namen wählen.' });
      const run = (sql, ...args) => db.prepare(sql).bind(...args).run();
      const body = method === 'GET' ? {} : await request.json().catch(() => ({}));

      // ---------- Line-up: alles auf einmal (klein: ~100 Acts × 6 Personen) ----------
      if (path === '/api/lineup' && method === 'GET') {
        return reply(200, {
          acts: await all('SELECT id, name, day, stage, start, end_time AS "end", created_by AS by, updated FROM acts WHERE deleted = 0 ORDER BY name COLLATE NOCASE'),
          marks: await all('SELECT person_id AS person, act_id AS act, level FROM marks'),
          settings: Object.fromEntries((await all('SELECT key, value FROM settings')).map((r) => [r.key, r.value])),
          meets: await all('SELECT day, place, time, updated_by AS by, updated FROM meets'),
          now: Date.now(),
        });
      }

      // Treffpunkt für einen Festivaltag (Ort + Uhrzeit; leerer Ort = löschen)
      const mm = /^\/api\/meets\/(\d{4}-\d{2}-\d{2})$/.exec(path);
      if (mm && method === 'PUT') {
        if (!day(mm[1])) return reply(400, { error: 'Das ist kein Festivaltag.' });
        const place = clip(body.place, 120).trim();
        if (!place) { await run('DELETE FROM meets WHERE day = ?', mm[1]); return reply(200, { ok: true }); }
        await run(`INSERT INTO meets (day, place, time, updated_by, updated) VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT(day) DO UPDATE SET place = excluded.place, time = excluded.time, updated_by = excluded.updated_by, updated = excluded.updated`,
        mm[1], place, hhmm(body.time), me.id, Date.now());
        return reply(200, { ok: true });
      }

      // Gemeinsame Einstellung setzen (nur bekannte Schlüssel)
      const ms = /^\/api\/settings\/(tricount|planb)$/.exec(path);
      if (ms && method === 'PUT') {
        const value = clip(body.value, 300).trim();
        if (ms[1] === 'tricount' && value && !/^https:\/\/([\w-]+\.)*tricount\.com\/\S*$/i.test(value)) return reply(400, { error: 'Bitte den Link aus Tricount einfügen (beginnt mit https://…tricount.com/).' });
        await run(`INSERT INTO settings (key, value, updated_by, updated) VALUES (?, ?, ?, ?)
                   ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated = excluded.updated`, ms[1], value, me.id, Date.now());
        return reply(200, { ok: true });
      }

      // Act eintragen (id vom Handy → zweimal senden schadet nicht)
      if (path === '/api/acts' && method === 'POST') {
        const id = clip(body.id, 60);
        const name = clip(body.name, 80).trim();
        if (!/^[\w-]{4,60}$/.test(id) || !name) return reply(400, { error: 'Bitte einen Namen eingeben.' });
        const n = (await db.prepare('SELECT COUNT(*) AS n FROM acts').first()).n;
        if (n >= MAX_ACTS) return reply(400, { error: 'Das Line-up ist voll.' });
        await run(`INSERT INTO acts (id, name, day, created_by, updated_by, updated) VALUES (?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET deleted = 0`, id, name, day(body.day), me.id, me.id, Date.now());
        return reply(200, { ok: true });
      }

      let m = /^\/api\/acts\/([\w-]{4,60})$/.exec(path);
      if (m && method === 'PUT') {
        const name = clip(body.name, 80).trim();
        if (!name) return reply(400, { error: 'Bitte einen Namen eingeben.' });
        // Bühne und Uhrzeiten nur ändern, wenn sie mitgeschickt werden (ältere Handys schicken nur Name und Tag)
        const has = (k) => Object.prototype.hasOwnProperty.call(body, k);
        await run(`UPDATE acts SET name = ?, day = ?,
                     stage = CASE WHEN ? THEN ? ELSE stage END,
                     start = CASE WHEN ? THEN ? ELSE start END,
                     end_time = CASE WHEN ? THEN ? ELSE end_time END,
                     updated_by = ?, updated = ? WHERE id = ?`,
        name, day(body.day),
        has('stage') ? 1 : 0, clip(body.stage, 40).trim() || null,
        has('start') ? 1 : 0, hhmm(body.start),
        has('end') ? 1 : 0, hhmm(body.end),
        me.id, Date.now(), m[1]);
        return reply(200, { ok: true });
      }
      if (m && method === 'DELETE') {
        await run('UPDATE acts SET deleted = 1, updated_by = ?, updated = ? WHERE id = ?', me.id, Date.now(), m[1]);
        return reply(200, { ok: true });
      }

      // Eigene Markierung setzen oder löschen (level leer = keine Markierung)
      m = /^\/api\/marks\/([\w-]{4,60})$/.exec(path);
      if (m && method === 'PUT') {
        const level = String(body.level || '');
        if (!level) {
          await run('DELETE FROM marks WHERE person_id = ? AND act_id = ?', me.id, m[1]);
          return reply(200, { ok: true });
        }
        if (!LEVELS.includes(level)) return reply(400, { error: 'Unbekannte Markierung.' });
        const act = await db.prepare('SELECT id FROM acts WHERE id = ?').bind(m[1]).first();
        if (!act) return reply(404, { error: 'Diesen Act gibt es nicht mehr.' });
        await run(`INSERT INTO marks (person_id, act_id, level, updated) VALUES (?, ?, ?, ?)
                   ON CONFLICT(person_id, act_id) DO UPDATE SET level = excluded.level, updated = excluded.updated`, me.id, m[1], level, Date.now());
        return reply(200, { ok: true });
      }

      return reply(404, { error: 'Unbekannte Adresse.' });
    } catch (err) {
      console.error(err);
      return reply(500, { error: 'Da ist auf dem Server etwas schiefgelaufen.' });
    }
  },
};

// ---------- Helfer ----------
const normCode = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const clip = (s, n) => String(s ?? '').slice(0, n);
const day = (s) => (FESTIVAL_DAYS.includes(s) ? s : null); // nur echte Festivaltage, sonst „noch offen"
const hhmm = (s) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || '')) ? String(s) : null); // Uhrzeit „21:30", sonst leer

// ---------- Ausweis (Token) ----------
const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function hmacKey(env) {
  return crypto.subtle.importKey('raw', enc.encode('sziget-v1|' + normCode(env.GROUP_CODE)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function makeToken(env, data) {
  const payload = b64url(enc.encode(JSON.stringify(data)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

async function checkToken(env, header) {
  const m = /^Bearer ([\w-]+)\.([\w-]+)$/.exec(header || '');
  if (!m) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env), fromB64url(m[2]), enc.encode(m[1]));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(m[1])));
    if (!data.iat || Date.now() - data.iat > TOKEN_DAYS * 86400000) return null;
    return data;
  } catch {
    return null;
  }
}

// Vergleich, der keine Zeitunterschiede verrät
async function sameText(a, b) {
  const [x, y] = await Promise.all([a, b].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}
