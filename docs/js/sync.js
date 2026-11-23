// Geteilte Daten mit Warteschlange – damit Eingaben auch ohne Netz klappen.
// - Der letzte Stand vom Worker liegt auf dem Handy (localStorage) → die Seiten gehen offline.
// - Jede Änderung kommt sofort in die eigene Ansicht UND in die Warteschlange.
// - Die Warteschlange wird gesendet: beim Öffnen, wenn Netz zurückkommt, und jede Minute, solange die App offen ist.
// - Doppeltes Senden ist harmlos: neue Acts tragen eine Kennung vom Handy, Markierungen gehören je einer Person.
import { call, ApiError, newId } from './api.js?v=0.5.0';
import { store } from './store.js?v=0.5.0';
import { toast } from './ui.js?v=0.5.0';

const listeners = new Set();
export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const changed = () => listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });

// ---------- Warteschlange ----------
const queue = () => store.getJson('queue') || [];
const saveQueue = (q) => store.setJson('queue', q);
export const pending = () => queue().length;

function enqueue(op) {
  const q = queue();
  // Gleiche Markierung mehrfach geändert → nur die letzte zählt
  if (op.key) {
    const i = q.findIndex((o) => o.key === op.key);
    if (i >= 0) q.splice(i, 1);
  }
  q.push({ ...op, as: store.get('person'), at: Date.now() });
  saveQueue(q);
  changed();
  flush();
}

let flushing = false;
export async function flush() {
  if (flushing || !queue().length) return;
  flushing = true;
  let sent = 0;
  try {
    while (queue().length) {
      const op = queue()[0];
      try {
        await call(op.path, { method: op.method, body: op.body, as: op.as });
      } catch (ex) {
        if (ex instanceof ApiError && (ex.status === 0 || ex.status >= 500 || ex.status === 401 || ex.status === 429)) break; // später nochmal
        toast(`Nicht gespeichert: ${ex.message}`, 4000); // z. B. Act wurde inzwischen gelöscht → verwerfen
      }
      saveQueue(queue().slice(1));
      sent++;
    }
  } finally {
    flushing = false;
  }
  if (sent) await refresh();
  else changed();
}

// ---------- Line-up ----------
let snapshot = store.getJson('lineup'); // { acts, marks, now, fetched }

export async function refresh() {
  try {
    const data = await call('/api/lineup');
    snapshot = { ...data, fetched: Date.now() };
    store.setJson('lineup', snapshot);
    changed();
    return true;
  } catch {
    return false; // offline: alter Stand bleibt
  }
}

export const lastSync = () => snapshot?.fetched || null;

// Ansicht = letzter Stand vom Worker + noch nicht gesendete eigene Änderungen
export function lineup() {
  const acts = new Map((snapshot?.acts || []).map((a) => [a.id, { ...a }]));
  const marks = new Map((snapshot?.marks || []).map((m) => [`${m.person}|${m.act}`, m]));
  for (const op of queue()) {
    const a = op.apply;
    if (!a) continue;
    if (a.t === 'act-add' || a.t === 'act-edit') acts.set(a.act.id, { ...(acts.get(a.act.id) || {}), ...a.act });
    if (a.t === 'act-del') acts.delete(a.id);
    if (a.t === 'mark') {
      const k = `${a.person}|${a.act}`;
      if (a.level) marks.set(k, { person: a.person, act: a.act, level: a.level }); else marks.delete(k);
    }
  }
  return {
    acts: [...acts.values()].sort((x, y) => x.name.localeCompare(y.name, 'de', { sensitivity: 'base' })),
    marks: [...marks.values()].filter((m) => acts.has(m.act)),
  };
}

// Gemeinsame Einstellungen (z. B. Tricount-Link) = letzter Stand + noch nicht gesendete Änderungen
export function settings() {
  const s = { ...(snapshot?.settings || {}) };
  for (const op of queue()) if (op.apply?.t === 'setting') s[op.apply.key] = op.apply.value;
  return s;
}

export function setSetting(key, value) {
  enqueue({
    key: `setting|${key}`,
    path: `/api/settings/${key}`, method: 'PUT', body: { value },
    apply: { t: 'setting', key, value },
  });
}

export function setMark(person, act, level) {
  enqueue({
    key: `mark|${person}|${act}`,
    path: `/api/marks/${act}`, method: 'PUT', body: { level: level || '' },
    apply: { t: 'mark', person, act, level: level || '' },
  });
}

export function addAct(name, day, person) {
  const id = 'a-' + newId().replace(/-/g, '').slice(0, 16);
  enqueue({
    path: '/api/acts', method: 'POST', body: { id, name, day },
    apply: { t: 'act-add', act: { id, name, day: day || null, by: person } },
  });
  return id;
}

// f = { name, day, stage, start, end } – Bühne und Uhrzeiten leer = noch offen
export function editAct(id, f) {
  const act = { id, name: f.name, day: f.day || null, stage: f.stage || null, start: f.start || null, end: f.end || null };
  enqueue({
    key: `act|${id}`,
    path: `/api/acts/${id}`, method: 'PUT', body: { name: act.name, day: act.day, stage: act.stage || '', start: act.start || '', end: act.end || '' },
    apply: { t: 'act-edit', act },
  });
}

// Treffpunkte je Festivaltag = letzter Stand + noch nicht gesendete Änderungen
export function meets() {
  const m = new Map((snapshot?.meets || []).map((x) => [x.day, x]));
  for (const op of queue()) {
    const a = op.apply;
    if (a?.t !== 'meet') continue;
    if (a.place) m.set(a.day, { day: a.day, place: a.place, time: a.time || null, by: op.as, updated: op.at }); else m.delete(a.day);
  }
  return m;
}

export function setMeet(day, place, time) {
  enqueue({
    key: `meet|${day}`,
    path: `/api/meets/${day}`, method: 'PUT', body: { place, time },
    apply: { t: 'meet', day, place, time },
  });
}

export function deleteAct(id) {
  enqueue({ key: `act|${id}`, path: `/api/acts/${id}`, method: 'DELETE', apply: { t: 'act-del', id } });
}

// ---------- automatisch senden und auffrischen ----------
let started = false;
export function startSync() {
  flush().then(refresh);
  if (started) return;
  started = true;
  addEventListener('online', () => flush().then(refresh));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') flush().then(refresh);
  });
  setInterval(() => { if (document.visibilityState === 'visible') flush().then(refresh); }, 60000);
}
