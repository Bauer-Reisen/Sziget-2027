// Startseite: Countdown, Offline-Zustand, Home-Bildschirm-Hinweis, was als Nächstes kommt.
import { esc } from './ui.js?v=0.3.0';
import { me, festivalStatus, fmtDate } from './ctx.js?v=0.3.0';
import { FESTIVAL } from './config.js?v=0.3.0';
import { installBanner, wireInstall } from './install.js?v=0.3.0';
import { offlineState, online } from './offline.js?v=0.3.0';
import { lineup, onChange } from './sync.js?v=0.3.0';

function countdown() {
  const s = festivalStatus();
  if (s.phase === 'vorher') {
    const weeks = Math.floor(s.days / 7);
    return `
      <div class="count">
        <p class="count-label">noch</p>
        <p class="count-num">${s.days}</p>
        <p class="count-label">${s.days === 1 ? 'Tag' : 'Tage'} bis zur Insel</p>
        ${weeks >= 2 ? `<p class="count-sub">Das sind gut ${weeks} Wochen.</p>` : s.days === 1 ? '<p class="count-sub">Morgen geht’s los!</p>' : ''}
      </div>`;
  }
  if (s.phase === 'festival') {
    return `
      <div class="count">
        <p class="count-label">Festivaltag</p>
        <p class="count-num">${s.dayNr}<span class="count-of"> von ${FESTIVAL.days}</span></p>
        <p class="count-sub">Viel Spaß heute!</p>
      </div>`;
  }
  return `
    <div class="count">
      <p class="count-num count-small">Das war’s</p>
      <p class="count-sub">Schön war’s mit euch auf der Insel.</p>
    </div>`;
}

// Kurzer Stand zum Line-up mit Sprung dorthin
function lineupCard() {
  const lu = lineup();
  const meId = me()?.id;
  const mine = lu.marks.filter((m) => m.person === meId).length;
  const counts = new Map();
  for (const m of lu.marks) if (m.level !== 'egal') counts.set(m.act, (counts.get(m.act) || 0) + 1);
  const top = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([id, n]) => `${esc(lu.acts.find((a) => a.id === id)?.name || '')} (${n})`);
  return `
    <a class="card card-link" href="#/lineup" id="lu-card">
      <h3>Line-up →</h3>
      <p>${mine ? `Du hast ${mine} von ${lu.acts.length} Acts markiert.` : `${lu.acts.length} Acts warten auf deine Markierung.`}</p>
      ${top.length ? `<p class="hint">Gemeinsam vorne: ${top.join(', ')}</p>` : ''}
    </a>`;
}

const OFFLINE_TEXT = {
  bereit: ['ok', 'Offline bereit ✓', 'Die App ist auf diesem Handy gespeichert und läuft auch ohne Netz.'],
  laedt: ['wait', 'Wird für offline gespeichert …', 'Lass die App kurz offen, solange Netz da ist.'],
  aus: ['off', 'Offline-Speicher aus', 'Hier am PC zum Testen ausgeschaltet. Auf dem Handy passiert das von selbst.'],
};

export async function renderStart(view) {
  const p = me();
  view.innerHTML = `
    <section class="page">
      <p class="kicker">Hallo ${esc(p?.name || '')}</p>
      <h1 class="title">Insel 27</h1>
      <p class="lead">${fmtDate(FESTIVAL.first, { day: 'numeric', month: 'long' })} – ${fmtDate(FESTIVAL.last, { day: 'numeric', month: 'long', year: 'numeric' })}<br>Óbuda-Insel, Budapest</p>
      ${countdown()}
      <div id="offline"></div>
      ${installBanner()}
      ${lineupCard()}
      <div class="card">
        <h3>Was als Nächstes kommt</h3>
        <ul class="next">
          <li><strong>Infos ohne Netz:</strong> Regeln, Notfall, Anreise und Camping.</li>
          <li><strong>Unser Tag</strong> (sobald der Zeitplan da ist, ca. Juni): wer ist wann wo, Treffpunkte.</li>
        </ul>
      </div>
    </section>`;
  wireInstall(view);
  // Neuer Stand vom Worker → Line-up-Karte auffrischen
  const off = onChange(() => {
    const card = view.querySelector('#lu-card');
    if (!card) return off();
    card.outerHTML = lineupCard();
  });
  await showOffline(view);
}

async function showOffline(view) {
  const box = view.querySelector('#offline');
  if (!box) return;
  let state = await offlineState();
  const paint = () => {
    const [cls, title, text] = OFFLINE_TEXT[state];
    box.innerHTML = `<div class="status status-${cls}"><strong>${title}</strong><span>${text}</span>${online() ? '' : '<span class="net">Gerade kein Netz – du siehst den zuletzt gespeicherten Stand.</span>'}</div>`;
  };
  paint();
  // Während des ersten Speicherns ein paar Mal nachsehen
  for (let i = 0; state === 'laedt' && i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    if (!box.isConnected) return;
    state = await offlineState();
    paint();
  }
}
