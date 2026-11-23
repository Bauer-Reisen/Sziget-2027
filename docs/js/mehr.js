// „Mehr": Name ändern, Rundgang, Home-Bildschirm, Offline neu speichern, Abmelden.
import { esc } from './ui.js?v=0.6.0';
import { me } from './ctx.js?v=0.6.0';
import { VERSION } from './config.js?v=0.6.0';
import { shareCard } from './teilen.js?v=0.6.0';
import { installCard } from './install.js?v=0.6.0';

export function renderMore(view) {
  const p = me();
  view.innerHTML = `
    <section class="page">
      <h1 class="title title-sm">Mehr</h1>
      <div class="card">
        <h3>Du bist ${esc(p?.name || '')}</h3>
        <p>Falsch gewählt? Dann hier wechseln.</p>
        <button type="button" class="btn" data-act="who">Ich bin nicht ${esc(p?.name || '')}</button>
      </div>
      ${shareCard()}
      ${installCard()}
      <div class="card">
        <h3>Ohne Netz</h3>
        <p>Die App speichert sich von selbst. Klappt etwas nicht, hier alles noch einmal speichern (dafür braucht es Netz).</p>
        <button type="button" class="btn" data-act="offline">Alles neu speichern</button>
      </div>
      <div class="card">
        <h3>Hilfe</h3>
        <button type="button" class="btn" data-act="tour">Rundgang ansehen</button>
      </div>
      <div class="card">
        <button type="button" class="btn btn-quiet" data-act="logout">Abmelden</button>
      </div>
      <p class="hint center">Version ${VERSION}</p>
    </section>`;
}
