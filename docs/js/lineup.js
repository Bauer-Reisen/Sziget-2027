// Line-up: Acts eintragen, jede Person markiert Muss / Gern / Egal, alle sehen die Markierungen der Gruppe.
// Geht auch ohne Netz (Warteschlange in sync.js).
import { esc, dialog, toast } from './ui.js?v=0.5.1';
import { ctx, me, fmtDate } from './ctx.js?v=0.5.1';
import { store } from './store.js?v=0.5.1';
import { FESTIVAL_DAYS, LINEUP_STAND } from './config.js?v=0.5.1';
import { ACT_INFO, INFO_STAND, LIVE_LABEL, spotifyArtist, spotifySearch, spotifyEmbed } from './actinfo.js?v=0.5.1';
import { lineup, setMark, addAct, editAct, deleteAct, onChange, pending, lastSync, flush, refresh } from './sync.js?v=0.5.1';

const LEVELS = [
  ['muss', 'Muss'],
  ['gern', 'Gern'],
  ['egal', 'Egal'],
];
const norm = (s) => s.toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu, '');
const dayShort = (iso) => (iso ? fmtDate(iso, { weekday: 'short', day: 'numeric', month: 'numeric' }) : '');
// „Fr. 13.8. 21:30" – im Steckbrief mit Ende und Bühne
const when = (a, long) => [dayShort(a.day), a.start ? (long && a.end ? `${a.start}–${a.end}` : a.start) : '', long && a.stage ? a.stage : ''].filter(Boolean).join(' · ');
const nameOf = (id) => ctx.people?.persons.find((p) => p.id === id)?.name || id;
const order = () => (ctx.people?.persons || []).map((p) => p.id);

let mode = store.get('lineupMode') || 'alle'; // alle | gruppe | meine
let query = '';
let liveOnly = store.get('lineupLive') === '1';
let unsub = null;

export function renderLineup(view) {
  view.innerHTML = `
    <section class="page lineup">
      <div class="page-head">
        <h1 class="title title-sm">Line-up</h1>
        <button type="button" class="help-btn" data-act="help" aria-label="Wie funktioniert das?">?</button>
      </div>
      <p class="hint" id="lu-stand"></p>
      <div class="seg" role="group" aria-label="Ansicht">
        <button type="button" data-mode="alle">Alle</button>
        <button type="button" data-mode="gruppe">Gemeinsam</button>
        <button type="button" data-mode="meine">Meine</button>
      </div>
      <button type="button" class="chip" data-act="live">🔥 Nur Live-Tipps</button>
      <div class="search">
        <input type="search" id="lu-q" placeholder="Act suchen …" autocomplete="off" enterkeyhint="search" value="${esc(query)}">
      </div>
      <div id="lu-wait"></div>
      <div id="lu-list"></div>
      <button type="button" class="btn btn-wide add-act" data-act="add">+ Act eintragen</button>
    </section>`;

  view.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    store.set('lineupMode', mode);
    paint(view);
  }));
  view.querySelector('#lu-q').addEventListener('input', (e) => { query = e.target.value; paintList(view); });
  view.querySelector('[data-act=add]').addEventListener('click', () => addDialog(view));
  view.querySelector('[data-act=help]').addEventListener('click', () => explain(true));
  view.querySelector('[data-act=live]').addEventListener('click', () => {
    liveOnly = !liveOnly;
    store.set('lineupLive', liveOnly ? '1' : '');
    paint(view);
  });

  // Markieren und Bearbeiten (ein Klick-Empfänger für die ganze Liste)
  view.querySelector('#lu-list').addEventListener('click', (e) => {
    const lv = e.target.closest('[data-level]');
    if (lv) {
      const act = lv.closest('[data-id]').dataset.id;
      const mine = myLevel(lineup(), act);
      setMark(me().id, act, mine === lv.dataset.level ? '' : lv.dataset.level); // nochmal tippen = zurücknehmen
      return;
    }
    const det = e.target.closest('[data-detail]');
    if (det) detailDialog(det.dataset.detail);
  });

  unsub?.();
  unsub = onChange(() => { if (view.isConnected && view.querySelector('.lineup')) paint(view); else unsub?.(); });
  paint(view);
  explain(false);
}

const myLevel = (lu, act) => lu.marks.find((m) => m.person === me()?.id && m.act === act)?.level || '';

function paint(view) {
  view.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  view.querySelector('[data-act=live]').setAttribute('aria-pressed', String(liveOnly));
  const lu = lineup();
  const t = lastSync();
  view.querySelector('#lu-stand').textContent = `${LINEUP_STAND} · ${lu.acts.length} Acts${t ? ` · abgeglichen ${new Date(t).toLocaleString('de-DE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}`;
  const n = pending();
  const wait = view.querySelector('#lu-wait');
  wait.innerHTML = n
    ? `<div class="status status-wait"><strong>${n} Änderung${n > 1 ? 'en' : ''} warte${n > 1 ? 'n' : 't'} aufs Senden</strong><span>Das passiert von selbst, sobald Netz da ist.</span><button type="button" class="btn btn-small" data-act="retry">Jetzt senden</button></div>`
    : '';
  wait.querySelector('[data-act=retry]')?.addEventListener('click', () => flush());
  paintList(view, lu);
}

function paintList(view, lu = lineup()) {
  const list = view.querySelector('#lu-list');
  if (!list) return;
  const q = norm(query);
  const meId = me()?.id;
  const byAct = new Map();
  for (const m of lu.marks) {
    if (!byAct.has(m.act)) byAct.set(m.act, []);
    byAct.get(m.act).push(m);
  }
  let acts = lu.acts.filter((a) => (!q || norm(a.name).includes(q) || norm(ACT_INFO[a.id]?.genre || '').includes(q))
    && (!liveOnly || ACT_INFO[a.id]?.live === 3));
  const score = (a) => (byAct.get(a.id) || []).reduce((s, m) => s + (m.level === 'muss' ? 2 : m.level === 'gern' ? 1 : 0), 0);

  if (mode === 'meine') acts = acts.filter((a) => ['muss', 'gern'].includes(myLevel(lu, a.id)))
    .sort((a, b) => (myLevel(lu, a.id) === 'muss' ? 0 : 1) - (myLevel(lu, b.id) === 'muss' ? 0 : 1) || a.name.localeCompare(b.name, 'de'));
  if (mode === 'gruppe') acts = acts.filter((a) => score(a) > 0).sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name, 'de'));

  if (!acts.length) {
    list.innerHTML = `<p class="empty">${
      q ? 'Nichts gefunden. Unten kannst du den Act eintragen.'
        : liveOnly ? 'Hier gibt es gerade keine Live-Tipps.'
        : mode === 'meine' ? 'Du hast noch nichts mit Muss oder Gern markiert.'
          : mode === 'gruppe' ? 'Noch hat niemand etwas mit Muss oder Gern markiert.'
            : 'Noch keine Acts eingetragen.'}</p>`;
    return;
  }

  const ids = order();
  list.innerHTML = acts.map((a) => {
    const marks = (byAct.get(a.id) || []).sort((x, y) => ids.indexOf(x.person) - ids.indexOf(y.person));
    const mine = myLevel(lu, a.id);
    const others = (lvl) => marks.filter((m) => m.level === lvl && (mode === 'gruppe' || m.person !== meId)).map((m) => nameOf(m.person));
    const muss = others('muss');
    const gern = others('gern');
    const who = [
      muss.length ? `<span class="who-l who-muss">Muss: ${esc(muss.join(', '))}</span>` : '',
      gern.length ? `<span class="who-l who-gern">Gern: ${esc(gern.join(', '))}</span>` : '',
    ].join('');
    const together = muss.length + gern.length + (mode !== 'gruppe' && ['muss', 'gern'].includes(mine) ? 1 : 0);
    const info = ACT_INFO[a.id];
    return `
      <article class="act${mine ? ` is-${mine}` : ''}" data-id="${esc(a.id)}">
        <div class="act-top">
          <button type="button" class="act-main" data-detail="${esc(a.id)}" aria-label="${esc(a.name)}: Infos und Reinhören">
            ${info?.img ? `<img class="act-img" src="${esc(info.img)}" alt="" width="52" height="52" crossorigin="anonymous" referrerpolicy="no-referrer">` : `<span class="act-img act-img-none" aria-hidden="true">${esc(a.name.slice(0, 1))}</span>`}
            <span class="act-text">
              <span class="act-name">${esc(a.name)}</span>
              <span class="act-genre">${info?.live === 3 ? '<span class="act-live">🔥 Live-Tipp</span> ' : ''}${esc(info?.genre || 'Antippen für mehr')}</span>
            </span>
          </button>
          ${a.day ? `<span class="act-day">${esc(when(a))}</span>` : ''}
          ${together >= 2 ? `<span class="act-count" title="So viele von uns wollen hin">${together} 👥</span>` : ''}
        </div>
        ${who ? `<p class="act-who">${mode === 'gruppe' ? '' : '<span class="who-others">Andere:</span> '}${who}</p>` : ''}
        <div class="levels" role="group" aria-label="Deine Markierung für ${esc(a.name)}">
          ${LEVELS.map(([v, l]) => `<button type="button" class="lv lv-${v}" data-level="${v}" aria-pressed="${mine === v}">${l}</button>`).join('')}
        </div>
      </article>`;
  }).join('');
}

// ---------- Dialoge ----------
const dayOptions = (sel) => `
  <option value="">noch offen</option>
  ${FESTIVAL_DAYS.map((d) => `<option value="${d}" ${d === sel ? 'selected' : ''}>${esc(fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }))}</option>`).join('')}`;

async function addDialog(view) {
  const lu = lineup();
  const res = await dialog({
    title: 'Act eintragen',
    body: `
      <div class="form">
        <label for="act-name">Name</label>
        <input id="act-name" name="name" maxlength="80" autocomplete="off" value="${esc(query)}" required>
        <label for="act-day">Tag</label>
        <select id="act-day" name="day">${dayOptions('')}</select>
        <p class="hint">Den Tag kannst du auch später nachtragen.</p>
      </div>`,
    buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Eintragen', value: 'ok', primary: true }],
    validate: (f) => {
      const n = (f.name || '').trim();
      if (!n) return 'Bitte einen Namen eingeben.';
      if (lu.acts.some((a) => norm(a.name) === norm(n))) return 'Den gibt es schon in der Liste.';
      return '';
    },
  });
  if (res?.value !== 'ok') return;
  addAct(res.fields.name.trim(), res.fields.day, me().id);
  query = '';
  const q = view.querySelector('#lu-q');
  if (q) q.value = '';
  if (mode !== 'alle') { mode = 'alle'; store.set('lineupMode', mode); }
  paint(view);
  toast('Eingetragen. Jetzt gleich markieren!');
}

// Steckbrief: Bild, Stil, Herkunft, kurz erklärt, wie sie live sind, Songs zum Reinhören
async function detailDialog(id) {
  const a = lineup().acts.find((x) => x.id === id);
  if (!a) return;
  const info = ACT_INFO[id];
  const flames = info?.live ? '🔥'.repeat(info.live) : '';
  const hits = info?.hits?.length
    ? `<ul class="ad-hits">${info.hits.map((h) => `<li><a href="${esc(spotifySearch(`${a.name} ${h}`))}" target="_blank" rel="noopener">▶ ${esc(h)}</a></li>`).join('')}</ul>`
    : '';
  const spLink = info?.sp ? spotifyArtist(info.sp) : spotifySearch(a.name);
  const body = info ? `
    <div class="ad">
      ${info.img ? `<img class="ad-img" src="${esc(info.img)}" alt="" crossorigin="anonymous" referrerpolicy="no-referrer">` : ''}
      <p class="ad-meta"><strong>${esc(info.genre)}</strong><br>${esc(info.from)}${a.day ? ` · spielt ${esc(when(a, true))}` : ''}</p>
      <p>${esc(info.about)}</p>
      <div class="ad-live${info.live === 3 ? ' is-top' : ''}">
        <h3>Wie sind sie live? ${flames ? `<span>${flames} ${esc(LIVE_LABEL[info.live])}</span>` : ''}</h3>
        <p>${esc(info.liveText)}</p>
      </div>
      <h3>Reinhören</h3>
      ${hits}
      ${info.sp ? '<div class="ad-player"><button type="button" class="btn btn-small" data-play>▶ Hörproben hier abspielen</button></div>' : ''}
      <p><a class="btn btn-wide" href="${esc(spLink)}" target="_blank" rel="noopener">${info.sp ? 'In Spotify öffnen' : 'In Spotify suchen'}</a></p>
      <p class="hint">${esc(INFO_STAND)} · eigene Zusammenfassung aus Presse und Live-Kritiken.</p>
    </div>` : `
    <div class="ad">
      <p>${a.day ? `Spielt ${esc(when(a, true))}. ` : ''}Zu diesem Act gibt es noch keinen Steckbrief.</p>
      <p><a class="btn btn-wide" href="${esc(spotifySearch(a.name))}" target="_blank" rel="noopener">In Spotify suchen</a></p>
    </div>`;

  // Spotify-Player erst auf Wunsch laden (braucht Netz)
  const wirePlayer = () => {
    const btn = document.querySelector('dialog[open] [data-play]');
    btn?.addEventListener('click', () => {
      if (!navigator.onLine) { toast('Dafür braucht es Netz.'); return; }
      btn.parentElement.innerHTML = `<iframe class="ad-iframe" src="${esc(spotifyEmbed(info.sp))}" title="Spotify: ${esc(a.name)}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    });
  };
  const p = dialog({
    title: a.name,
    body,
    buttons: [{ label: 'Ändern', value: 'edit' }, { label: 'Schließen', value: 'close', primary: true }],
  });
  wirePlayer();
  const dlg = document.querySelector("dialog[open]");
  requestAnimationFrame(() => { if (dlg) dlg.scrollTop = 0; }); // oben anfangen, nicht beim Knopf unten
  const res = await p;
  if (res?.value === 'edit') editDialog(id);
}

async function editDialog(id) {
  const a = lineup().acts.find((x) => x.id === id);
  if (!a) return;
  const res = await dialog({
    title: 'Act ändern',
    body: `
      <div class="form">
        <label for="act-name">Name</label>
        <input id="act-name" name="name" maxlength="80" autocomplete="off" value="${esc(a.name)}" required>
        <label for="act-day">Tag</label>
        <select id="act-day" name="day">${dayOptions(a.day || '')}</select>
        <label for="act-stage">Bühne</label>
        <input id="act-stage" name="stage" maxlength="40" autocomplete="off" list="stages" value="${esc(a.stage || '')}" placeholder="z. B. Main Stage">
        <datalist id="stages">${[...new Set(lineup().acts.map((x) => x.stage).filter(Boolean))].sort().map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
        <div class="time-row">
          <div><label for="act-start">Beginn</label><input id="act-start" name="start" type="time" value="${esc(a.start || '')}"></div>
          <div><label for="act-end">Ende</label><input id="act-end" name="end" type="time" value="${esc(a.end || '')}"></div>
        </div>
        <p class="hint">Nach Mitternacht? Einfach z. B. 01:30 eintragen – zählt zum Festivaltag davor.</p>
      </div>`,
    buttons: [{ label: 'Löschen', value: 'del' }, { label: 'Abbrechen', value: 'no' }, { label: 'Speichern', value: 'ok', primary: true }],
    validate: (f) => {
      if (!(f.name || '').trim()) return 'Bitte einen Namen eingeben.';
      if ((f.start || f.end) && !f.day) return 'Für eine Uhrzeit bitte auch den Tag wählen.';
      return '';
    },
  });
  if (res?.value === 'ok') {
    const f = res.fields;
    editAct(id, { name: f.name.trim(), day: f.day, stage: (f.stage || '').trim(), start: f.start || '', end: f.end || '' });
  }
  if (res?.value === 'del') {
    const n = lineup().marks.filter((m) => m.act === id).length;
    const ok = await dialog({
      title: `${a.name} löschen?`,
      body: `<p>Der Act verschwindet für alle${n ? ` – samt ${n} Markierung${n > 1 ? 'en' : ''}` : ''}.</p>`,
      buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Löschen', value: 'yes', primary: true }],
    });
    if (ok?.value === 'yes') deleteAct(id);
  }
}

// Einmal-Erklärung beim ersten Öffnen (über „?" jederzeit wieder)
async function explain(force) {
  if (!force && store.get('help.lineup')) return;
  if (!force) {
    // Erst warten, bis Rundgang oder „Was ist neu?" zu sind – nie zwei Fenster übereinander
    await new Promise((r) => setTimeout(r, 500));
    while (document.querySelector('dialog[open]')) await new Promise((r) => setTimeout(r, 400));
    if (!document.querySelector('.lineup')) return; // inzwischen weggeblättert
  }
  store.set('help.lineup', '1');
  await dialog({
    title: 'So geht das Line-up',
    body: `
      <ul class="explain">
        <li>Tippe bei jedem Act <strong>Muss</strong>, <strong>Gern</strong> oder <strong>Egal</strong>. Nochmal tippen nimmt es zurück.</li>
        <li>Tippe auf <strong>Bild oder Namen</strong>: Steckbrief mit Musikrichtung, Herkunft, wie sie live sind und Songs zum Reinhören.</li>
        <li><strong>🔥 Live-Tipp</strong> heißt: Die Kritiker sagen, die Show reißt mit.</li>
        <li><strong>Gemeinsam</strong> zeigt oben, wen die meisten von uns sehen wollen.</li>
        <li>Fehlt ein Act? Unten auf <strong>„+ Act eintragen"</strong>. Ändern oder löschen geht im Steckbrief.</li>
        <li>Geht auch ohne Netz – deine Markierungen werden später gesendet.</li>
      </ul>`,
    buttons: [{ label: 'Alles klar', value: true, primary: true }],
  });
}

export { refresh as refreshLineup };
