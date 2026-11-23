// Einstieg der App: Code eingeben → Name wählen → Seiten.
// Läuft auch ohne Netz: Ausweis und die sechs Namen liegen auf dem Handy.
import { VERSION } from './config.js?v=0.5.0';
import { store } from './store.js?v=0.5.0';
import { login, loggedIn, logout, cachedPeople, fetchPeople, ApiError } from './api.js?v=0.5.0';
import { esc, dialog, toast } from './ui.js?v=0.5.0';
import { runTour } from './tour.js?v=0.5.0';
import { unseen, showNews, NEWS } from './news.js?v=0.5.0';
import { ctx, me } from './ctx.js?v=0.5.0';
import { renderStart } from './start.js?v=0.5.0';
import { renderMore } from './mehr.js?v=0.5.0';
import { renderTabs, hideTabs } from './tabs.js?v=0.5.0';
import { registerSw, refreshOffline } from './offline.js?v=0.5.0';
import { renderLineup } from './lineup.js?v=0.5.0';
import { renderHeute } from './heute.js?v=0.5.0';
import { renderInfos } from './infos.js?v=0.5.0';
import { startSync } from './sync.js?v=0.5.0';

const view = document.getElementById('view');
const scroller = document.getElementById('scroller'); // nur dieser Bereich scrollt (fester Rahmen)

// ---------- 1. Code eingeben ----------
function showLogin(message = '') {
  hideTabs();
  view.innerHTML = `
    <section class="gate">
      <p class="kicker">Unsere Festival-App</p>
      <h1 class="title">Insel 27</h1>
      <p class="lead">Sechs Leute, fünf Tage, eine Insel.</p>
      <form class="card form" id="login" novalidate>
        <label for="code">Unser gemeinsamer Code</label>
        <input id="code" name="code" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required>
        <p class="error" role="alert">${esc(message)}</p>
        <button class="btn btn-primary btn-wide" type="submit">Weiter</button>
        <p class="hint">Den Code kennen nur wir sechs. Du gibst ihn auf diesem Handy nur einmal ein – danach geht die App auch ohne Netz.</p>
      </form>
    </section>`;
  const form = view.querySelector('#login');
  const input = form.querySelector('#code');
  input.focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const err = form.querySelector('.error');
    if (!input.value.trim()) { err.textContent = 'Bitte den Code eingeben.'; return; }
    btn.disabled = true; btn.textContent = 'Prüfe …'; err.textContent = '';
    try {
      await login(input.value);
      await start();
    } catch (ex) {
      err.textContent = ex.status === 0 ? 'Gerade kein Netz. Zum ersten Anmelden braucht es einmal Netz.' : ex.message;
      btn.disabled = false; btn.textContent = 'Weiter';
      input.select();
    }
  });
}

// ---------- 2. Wer bist du? ----------
function showWho() {
  hideTabs();
  const { couples, persons } = ctx.people;
  view.innerHTML = `
    <section class="gate">
      <p class="kicker">Fast geschafft</p>
      <h1 class="title title-sm">Wer bist du?</h1>
      <div class="who">
        ${couples.map((c) => `
          <div class="who-pair">
            ${persons.filter((p) => p.couple === c.id).map((p) => `
              <button type="button" class="who-btn" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join('')}
          </div>`).join('')}
      </div>
      <p class="hint center">Tippe auf <strong>deinen eigenen Namen</strong>. Das merkt sich dieses Handy. Ändern kannst du es unter „Mehr".</p>
    </section>`;
  view.querySelectorAll('.who-btn').forEach((b) => b.addEventListener('click', async () => {
    store.set('person', b.dataset.id);
    startSync();
    await route();
    await tourIfNew();
  }));
}

// Rundgang, solange er nicht bis zum Ende angesehen oder bewusst übersprungen wurde.
async function tourIfNew() {
  if (store.get('tourSeen')) return false;
  await runTour(me()?.name);
  store.set('tourSeen', '1');
  store.set('newsSeen', NEWS[0]?.v || VERSION);
  return true;
}

// ---------- Seiten ----------
async function route() {
  if (!me()) return showWho();
  const [, page] = (location.hash || '#/').split('/');
  if (page === 'mehr') { renderMore(view); wireMore(); }
  else if (page === 'lineup') renderLineup(view);
  else if (page === 'infos') renderInfos(view);
  else if (page === 'heute') renderHeute(view);
  else await renderStart(view);
  renderTabs(page || '');
}

function wireMore() {
  view.querySelector('[data-act=tour]')?.addEventListener('click', () => runTour());
  view.querySelector('[data-act=who]')?.addEventListener('click', () => showWho());
  view.querySelector('[data-act=offline]')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      const ok = await refreshOffline();
      toast(ok ? 'Wird neu gespeichert – auf der Startseite siehst du, wann es fertig ist.' : 'Hier am PC ist der Offline-Speicher aus.');
    } catch { toast('Das hat nicht geklappt. Ist Netz da?'); }
    e.target.disabled = false;
  });
  view.querySelector('[data-act=logout]')?.addEventListener('click', async () => {
    const r = await dialog({
      title: 'Abmelden?',
      body: '<p>Danach musst du auf diesem Handy den gemeinsamen Code neu eingeben – und dafür braucht es Netz.</p>',
      buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Abmelden', value: 'yes', primary: true }],
    });
    if (r?.value === 'yes') { logout(); ctx.people = null; showLogin(); }
  });
}

function showNoNet(ex) {
  hideTabs();
  view.innerHTML = `
    <section class="gate">
      <h1 class="title title-sm">Gerade keine Verbindung</h1>
      <p class="lead">${esc(ex.message)} Beim allerersten Öffnen braucht die App einmal Netz.</p>
      <button type="button" class="btn btn-primary" id="retry">Nochmal versuchen</button>
    </section>`;
  view.querySelector('#retry').addEventListener('click', start);
}

// ---------- Ablauf ----------
async function start() {
  if (!loggedIn()) return showLogin();
  ctx.people = cachedPeople();
  if (ctx.people?.persons?.length) {
    await route();                 // sofort, auch ohne Netz
    refreshPeople();               // im Hintergrund auffrischen
  } else {
    try { ctx.people = await fetchPeople(); } catch (ex) {
      if (ex instanceof ApiError && ex.status === 401) return showLogin('Bitte gib den Code noch einmal ein.');
      return showNoNet(ex);
    }
    if (!me()) return showWho();
    await route();
  }
  if (!me()) return;
  startSync();
  if (await tourIfNew()) return;
  const list = unseen(store.get('newsSeen'));
  if (list.length) {
    await showNews(list);
    store.set('newsSeen', NEWS[0].v);
  }
}

async function refreshPeople() {
  try {
    ctx.people = await fetchPeople();
  } catch (ex) {
    // Code geändert → neu anmelden. Kein Netz → einfach mit der gespeicherten Liste weiter.
    if (ex instanceof ApiError && ex.status === 401) { ctx.people = null; showLogin('Der Code wurde geändert. Bitte neu eingeben.'); }
  }
}

// ---------- „Zurück" und Scrollstelle ----------
addEventListener('hashchange', async () => {
  scroller.scrollTo(0, 0);
  if (ctx.people && loggedIn()) await route();
});

// ---------- Update-Prüfung (wie in der Film-App) ----------
async function checkForUpdate() {
  if (location.hostname === 'localhost') return;
  try {
    const res = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
    const { version } = await res.json();
    if (!version || version === VERSION) return;
    const key = 'insel.reloadedFor';
    if (sessionStorage.getItem(key) === version) return; // nie endlos neu laden
    sessionStorage.setItem(key, version);
    location.replace(`${location.pathname}?v=${version}${location.hash}`);
  } catch { /* offline – egal */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkForUpdate();
});
// Netz an/aus: Startseite neu zeichnen (zeigt „Gerade kein Netz")
const onStart = () => ctx.people && me() && (location.hash === '' || location.hash === '#/');
addEventListener('online', () => { if (onStart()) route(); });
addEventListener('offline', () => { if (onStart()) route(); });

registerSw();
checkForUpdate();
start().catch((ex) => { console.error(ex); toast('Da ist etwas schiefgelaufen.'); });
