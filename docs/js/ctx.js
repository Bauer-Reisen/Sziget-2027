// Gemeinsamer Zustand und Helfer für alle Seiten.
import { store } from './store.js?v=0.5.1';
import { FESTIVAL, DAY_START_HOUR } from './config.js?v=0.5.1';

export const ctx = { people: null };

export const me = () => ctx.people?.persons.find((p) => p.id === store.get('person')) || null;
export const person = (id) => ctx.people?.persons.find((p) => p.id === id) || null;

// ---------- Datum ----------
const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Festivaltag eines Zeitpunkts: von 6 Uhr bis 5:59 Uhr am nächsten Morgen.
// Ein Konzert um 01:30 Uhr am 12.08. gehört also zum Tag 11.08.
export const festivalDayOf = (date = new Date()) => isoOf(new Date(date.getTime() - DAY_START_HOUR * 3600 * 1000));

// Wo stehen wir? { phase: 'vorher' | 'festival' | 'nachher', days, dayNr }
export function festivalStatus(now = new Date()) {
  const today = parse(festivalDayOf(now));
  const first = parse(FESTIVAL.first);
  const last = parse(FESTIVAL.last);
  const diff = Math.round((first - today) / 86400000);
  if (diff > 0) return { phase: 'vorher', days: diff };
  if (today <= last) return { phase: 'festival', dayNr: 1 - diff };
  return { phase: 'nachher' };
}

export const fmtDate = (iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => parse(iso).toLocaleDateString('de-DE', opts);
