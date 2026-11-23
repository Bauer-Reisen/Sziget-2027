// Reiter „Heute": Plan für einen Festivaltag – wer will wann wo hin, Überschneidungen, Treffpunkt.
// Festivaltag läuft von 6 Uhr bis 6 Uhr: ein Act um 01:30 gehört zum Tag davor.
import { esc, dialog, toast } from './ui.js?v=0.5.1';
import { ctx, me, festivalDayOf, fmtDate } from './ctx.js?v=0.5.1';
import { store } from './store.js?v=0.5.1';
import { FESTIVAL_DAYS, DAY_START_HOUR } from './config.js?v=0.5.1';
import { lineup, meets, setMeet, settings, setSetting, onChange } from './sync.js?v=0.5.1';
import { ACT_INFO } from './actinfo.js?v=0.5.1';

let scope = store.get('heuteScope') || 'gruppe'; // gruppe | ich
let sel = null;

// Minuten seit 6 Uhr früh des Festivaltags → Sortieren und Überschneidungen über Mitternacht hinweg
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return (h < DAY_START_HOUR ? h + 24 : h) * 60 + m - DAY_START_HOUR * 60; };
const span = (a) => { const s = toMin(a.start); let e = a.end ? toMin(a.end) : s + 60; if (e <= s) e = s + 60; return [s, e]; };
const overlaps = (x, y) => { const [a, b] = span(x); const [c, d] = span(y); return a < d && c < b; };
const nameOf = (id) => ctx.people?.persons.find((p) => p.id === id)?.name || id;
const order = () => (ctx.people?.persons || []).map((p) => p.id);
const dayChip = (d) => fmtDate(d, { weekday: 'short', day: 'numeric', month: 'numeric' });
const clock = (ms) => new Date(ms).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function today() {
  const d = festivalDayOf();
  return FESTIVAL_DAYS.includes(d) ? d : null;
}

function nowMin() {
  const n = new Date();
  return toMin(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
}

export function renderHeute(view) {
  sel = today() || (FESTIVAL_DAYS.includes(store.get('heuteTag')) ? store.get('heuteTag') : FESTIVAL_DAYS[0]);
  view.innerHTML = `
    <section class="page heute">
      <h1 class="title title-sm">Unser Tag</h1>
      <div class="days" role="group" aria-label="Festivaltag">
        ${FESTIVAL_DAYS.map((d) => `<button type="button" data-day="${d}">${esc(dayChip(d))}${d === today() ? ' <span class="dot-today" aria-label="heute"></span>' : ''}</button>`).join('')}
      </div>
      <div id="hz-meet"></div>
      <div class="seg" role="group" aria-label="Wessen Plan">
        <button type="button" data-scope="gruppe">Gruppe</button>
        <button type="button" data-scope="ich">Nur ich</button>
      </div>
      <div id="hz-list"></div>
    </section>`;
  const sec = view.querySelector('.heute');
  sec.addEventListener('click', (e) => {
    const d = e.target.closest('[data-day]');
    if (d) { sel = d.dataset.day; if (!today()) store.set('heuteTag', sel); paint(view); return; }
    const s = e.target.closest('[data-scope]');
    if (s) { scope = s.dataset.scope; store.set('heuteScope', scope); paint(view); return; }
    if (e.target.closest('[data-act=meet]')) editMeet();
    if (e.target.closest('[data-act=planb]')) editPlanB();
  });
  const off = onChange(() => { if (view.querySelector('.heute')) paint(view); else off(); });
  paint(view);
}

function paint(view) {
  view.querySelectorAll('[data-day]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.day === sel)));
  view.querySelectorAll('[data-scope]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scope === scope)));
  view.querySelector('#hz-meet').innerHTML = meetCard();
  view.querySelector('#hz-list').innerHTML = list();
}

// ---------- Treffpunkt ----------
function meetCard() {
  const m = meets().get(sel);
  const planb = settings().planb || '';
  return `
    <div class="card meet">
      ${m ? `
        <p class="meet-label">📍 Treffpunkt ${sel === today() ? 'heute' : esc(dayChip(sel))}</p>
        <p class="meet-place">${esc(m.place)}${m.time ? ` <span>um ${esc(m.time)}</span>` : ''}</p>
        <p class="hint">Stand ${esc(clock(m.updated || Date.now()))}${m.by ? `, von ${esc(nameOf(m.by))}` : ''}</p>
        <button type="button" class="btn btn-small" data-act="meet">Ändern</button>`
    : `
        <p class="meet-label">📍 Treffpunkt ${sel === today() ? 'heute' : esc(dayChip(sel))}</p>
        <p>Noch keiner festgelegt.</p>
        <button type="button" class="btn btn-small" data-act="meet">Treffpunkt festlegen</button>`}
      <div class="planb">
        <p><strong>Plan B</strong> – wenn sich jemand verliert oder kein Netz da ist:<br>${planb ? esc(planb) : '<span class="muted">noch nicht festgelegt</span>'}</p>
        <button type="button" class="btn btn-quiet btn-small" data-act="planb">${planb ? 'Ändern' : 'Festlegen'}</button>
      </div>
    </div>`;
}

function placeSuggestions() {
  const s = new Set(lineup().acts.map((a) => a.stage).filter(Boolean));
  for (const m of meets().values()) s.add(m.place);
  if (settings().planb) s.add(settings().planb);
  return [...s].sort().map((x) => `<option value="${esc(x)}">`).join('');
}

async function editMeet() {
  const m = meets().get(sel);
  const res = await dialog({
    title: `Treffpunkt ${dayChip(sel)}`,
    body: `
      <div class="form">
        <label for="mt-place">Wo?</label>
        <input id="mt-place" name="place" maxlength="120" autocomplete="off" list="places" value="${esc(m?.place || '')}" placeholder="z. B. links vor der Main Stage">
        <datalist id="places">${placeSuggestions()}</datalist>
        <label for="mt-time">Wann? (kann leer bleiben)</label>
        <input id="mt-time" name="time" type="time" value="${esc(m?.time || '')}">
        <p class="hint">Alle sechs sehen den Treffpunkt – auch wer gerade kein Netz hat, sobald es kurz wieder da ist.</p>
      </div>`,
    buttons: [...(m ? [{ label: 'Löschen', value: 'del' }] : []), { label: 'Abbrechen', value: 'no' }, { label: 'Speichern', value: 'ok', primary: true }],
    validate: (f) => ((f.place || '').trim() ? '' : 'Bitte einen Ort eingeben.'),
  });
  if (res?.value === 'ok') { setMeet(sel, res.fields.place.trim(), res.fields.time || ''); toast('Treffpunkt gespeichert.'); }
  if (res?.value === 'del') { setMeet(sel, '', ''); toast('Treffpunkt gelöscht.'); }
}

async function editPlanB() {
  const res = await dialog({
    title: 'Plan-B-Treffpunkt',
    body: `
      <div class="form">
        <label for="pb">Fester Ort für alle Tage</label>
        <input id="pb" name="planb" maxlength="120" autocomplete="off" value="${esc(settings().planb || '')}" placeholder="z. B. am großen Sziget-Schriftzug">
        <p class="hint">Gilt immer, wenn sich jemand verliert und das Netz nicht geht. Am besten einen Ort, den man auch nachts findet.</p>
      </div>`,
    buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Speichern', value: 'ok', primary: true }],
  });
  if (res?.value !== 'ok') return;
  setSetting('planb', (res.fields.planb || '').trim());
  toast('Plan B gespeichert.');
}

// ---------- Tagesplan ----------
function list() {
  const lu = lineup();
  const meId = me()?.id;
  const ids = order();
  const marksOf = (act) => lu.marks.filter((m) => m.act === act && m.level !== 'egal').sort((x, y) => ids.indexOf(x.person) - ids.indexOf(y.person));
  const mine = (act) => lu.marks.find((m) => m.act === act && m.person === meId && m.level !== 'egal');
  let acts = lu.acts.filter((a) => a.day === sel && (scope === 'ich' ? mine(a.id) : marksOf(a.id).length));
  const timed = acts.filter((a) => a.start).sort((x, y) => toMin(x.start) - toMin(y.start));
  const open = acts.filter((a) => !a.start);
  const myTimed = timed.filter((a) => mine(a.id));

  if (!acts.length) {
    const any = lu.acts.some((a) => a.day === sel);
    return `<p class="empty">${scope === 'ich'
      ? 'An diesem Tag hast du noch nichts mit Muss oder Gern markiert.'
      : any ? 'An diesem Tag hat noch niemand etwas mit Muss oder Gern markiert.'
        : 'Für diesen Tag ist noch kein Act eingetragen. Tag und Uhrzeit trägst du im Line-up ein: Act antippen → Ändern.'}</p>`;
  }

  const live = sel === today() ? nowMin() : null;
  const nextId = live == null ? null : timed.find((a) => span(a)[0] > live)?.id;

  const row = (a) => {
    const ms = marksOf(a.id);
    const my = mine(a.id);
    const clash = my && a.start ? myTimed.filter((b) => b.id !== a.id && overlaps(a, b)) : [];
    const now = live != null && a.start && span(a)[0] <= live && live < span(a)[1];
    const info = ACT_INFO[a.id];
    return `
      <article class="slot${my ? ' is-mine' : ''}${now ? ' is-now' : ''}">
        <div class="slot-time">${a.start ? `<strong>${esc(a.start)}</strong>${a.end ? `<span>${esc(a.end)}</span>` : ''}` : '<span>offen</span>'}</div>
        <div class="slot-main">
          <p class="slot-name">${esc(a.name)}${now ? ' <span class="badge-now">läuft gerade</span>' : a.id === nextId ? ' <span class="badge-next">als Nächstes</span>' : ''}${info?.live === 3 ? ' <span class="slot-fire" title="Live-Tipp">🔥</span>' : ''}</p>
          ${a.stage ? `<p class="slot-stage">${esc(a.stage)}</p>` : ''}
          <p class="slot-who">${ms.map((m) => `<span class="who-chip lv-${m.level}${m.person === meId ? ' me' : ''}">${esc(nameOf(m.person))}</span>`).join('')}</p>
          ${clash.length ? `<p class="clash">⚠ Überschneidung für dich mit ${esc(clash.map((b) => b.name).join(', '))}</p>` : ''}
        </div>
      </article>`;
  };

  return `
    ${timed.map(row).join('')}
    ${open.length ? `<h3 class="slot-head">Uhrzeit noch offen</h3>${open.map(row).join('')}` : ''}
    <p class="hint legend"><span class="who-chip lv-muss">Name</span> = Muss · <span class="who-chip lv-gern">Name</span> = Gern</p>`;
}
