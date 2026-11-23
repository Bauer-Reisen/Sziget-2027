// Reiter „Infos": alles Wichtige zum Nachlesen – auch ohne Netz.
// Notfall, gemeinsame Kasse (Tricount-Link liegt nur beim Worker), Regeln, Anreise- und Camping-Analyse.
import { esc, dialog, toast } from './ui.js?v=0.6.0';
import { settings, setSetting, onChange } from './sync.js?v=0.6.0';

const TRICOUNT = /^https:\/\/([\w-]+\.)*tricount\.com\/\S*$/i;

const tel = (nr, label) => `<a class="tel" href="tel:${esc(nr.replace(/\s/g, ''))}"><strong>${esc(nr)}</strong><span>${esc(label)}</span></a>`;

function kasse() {
  const link = settings().tricount || '';
  return link
    ? `<p>Alle gemeinsamen Ausgaben tragen wir in Tricount ein. Am Ende rechnet Tricount aus, wer wem was zahlt.</p>
       <p><a class="btn btn-primary btn-wide" href="${esc(link)}" target="_blank" rel="noopener">Tricount öffnen</a></p>
       <button type="button" class="btn btn-quiet btn-small" data-act="tricount">Link ändern</button>`
    : `<p>Für gemeinsame Ausgaben nehmen wir <strong>Tricount</strong> (kostenlose App). So geht's:</p>
       <ol class="steps">
         <li>Eine Person legt in Tricount eine Gruppe „Sziget 2027" an.</li>
         <li>Dort auf <strong>Teilen</strong> tippen und den Link kopieren.</li>
         <li>Hier auf <strong>„Link einfügen"</strong> tippen – dann haben ihn alle sechs.</li>
       </ol>
       <button type="button" class="btn btn-wide" data-act="tricount">Link einfügen</button>`;
}

export function renderInfos(view) {
  view.innerHTML = `
    <section class="page infos">
      <h1 class="title title-sm">Infos</h1>
      <p class="hint">Alles hier geht auch ohne Netz.</p>

      <details class="info" open>
        <summary>🚑 Notfall</summary>
        <div class="tels">
          ${tel('112', 'Notruf (alles)')}
          ${tel('104', 'Rettungswagen')}
          ${tel('107', 'Polizei')}
          ${tel('105', 'Feuerwehr')}
        </div>
        <h3>Auf dem Gelände</h3>
        <ul>
          <li><strong>Medical Center:</strong> Ärzte und Pflege rund um die Uhr. Bei Allergie-Notfall: nächste Security oder Ordner ansprechen, die rufen Hilfe.</li>
          <li><strong>City Center:</strong> Info, Fundbüro und eine kleine <strong>Notfall-Botschaft</strong> für verlorene Ausweise.</li>
          <li><strong>Jemanden verloren?</strong> Zum Customer Service im City Center.</li>
        </ul>
        <h3>Deutsche Botschaft</h3>
        <p>Úri utca 64–66, 1014 Budapest<br>${tel('+36 1 488 3500', 'Zentrale, in akuten Notlagen mit Bereitschaftsdienst')}</p>
        <h3>Mitnehmen</h3>
        <ul>
          <li>Krankenkassenkarte (Rückseite = Europäische Versicherungskarte)</li>
          <li>Personalausweis, Ausweis-Foto auf dem Handy</li>
        </ul>
        <p class="src">Quelle: Sziget-Gesundheitsinfo 2026, Botschaft Budapest. Stand: 23.11.2026.</p>
      </details>

      <details class="info">
        <summary>💶 Gemeinsame Kasse</summary>
        <div id="kasse">${kasse()}</div>
      </details>

      <details class="info">
        <summary>🎟️ Ticket und Regeln</summary>
        <ul>
          <li><strong>5-Tage-Pass</strong> gilt Di 10.08. ab 08:00 bis So 15.08. 12:00. Zelten im normalen Bereich (Free Roam) ist dabei. Preis zurzeit 299 € (danach 349 €).</li>
          <li><strong>Armband</strong> ist das Ticket – nicht abnehmen.</li>
          <li><strong>Bezahlt wird ohne Bargeld:</strong> Karte, Handy oder Armband.</li>
          <li><strong>Eigenes Zelt:</strong> vorher kostenlos registrieren (Pflicht).</li>
          <li><strong>Erlaubt</strong> (Regeln 2026): Essen, eine Plastikflasche bis 2,5 l.</li>
          <li><strong>Verboten:</strong> Glas, mitgebrachter Alkohol, Gaskocher und Gaskartuschen, Feuerwerk, Drogen, Drohnen, Fahrräder und Roller.</li>
          <li><strong>Powerbank:</strong> noch unklar – kommt mit den Regeln 2027.</li>
        </ul>
        <p class="src">Regeln von 2026, die für 2027 erscheinen meist im Sommer. Quelle: szigetfestival.com. Stand: 23.11.2026.</p>
      </details>

      <details class="info">
        <summary>🚗 Anreise – was ist schlauer?</summary>
        <p>Pro Person, hin und zurück, ab Süddeutschland:</p>
        <table class="cmp">
          <tr><th>Weg</th><th>Preis</th><th>Dauer</th></tr>
          <tr class="best"><td><strong>Auto zu viert</strong></td><td>~104 €</td><td>10–11 Std.</td></tr>
          <tr><td>Auto zu zweit</td><td>~210 €</td><td>10–11 Std.</td></tr>
          <tr><td>Flug ab München</td><td>~385–412 €</td><td>7–8 Std.</td></tr>
          <tr><td>Bahn ab München</td><td>ab ~82 € + Zubringer</td><td>11–12 Std.</td></tr>
        </table>
        <p><strong>Empfehlung:</strong> Auto, möglichst voll besetzt. Mit Abstand am günstigsten, und das Campingzeug fährt mit. Fliegen lohnt nur ohne Zelt und wenn Zeit wichtiger ist als rund 280 €.</p>
        <p><strong>Losfahren:</strong> Di früh (ca. 4 Uhr) – der Pass gilt erst ab Di 08:00. Keine Nachtfahrt.</p>
        <p><strong>Pendeln Stadt ↔ Insel:</strong> Vorortbahn H5 von Batthyány tér bis Filatorigát, 10–15 Minuten, nachts Richtung Stadt durchgehend (Stand 2024).</p>
        <p class="src">Annahmen: 861 km, 7,5 l/100 km, 1,80 €/l, Vignetten Österreich und Ungarn, Festival-Parkplatz 156 € (Preis 2024). Flugpreise Kiwi.com, Stand 22.11.2026.</p>
      </details>

      <details class="info">
        <summary>⛺ Camping – welcher Bereich?</summary>
        <p>Pro Person, alle 5 Nächte:</p>
        <table class="cmp">
          <tr><th>Bereich</th><th>Preis</th><th>Toiletten</th></tr>
          <tr><td>Free Roam</td><td>im Pass</td><td>mit allen geteilt</td></tr>
          <tr class="best"><td><strong>Chill Camping, eigenes Zelt</strong></td><td>99 € (später 119 €)</td><td>eigene, nur für Gäste</td></tr>
          <tr><td>Chill Camping, Zelt steht schon</td><td>ab 129 €</td><td>eigene</td></tr>
          <tr><td>Sziget Ville Premium</td><td>~313–404 €</td><td>eigene, beste</td></tr>
        </table>
        <p><strong>Empfehlung:</strong> Chill Camping mit eigenem Zelt – der günstigste Bereich mit eigenen Toiletten, ruhiger, und alle Camper können zusammen stehen. Der günstige Preis gilt nur, solange die erste Preisstufe läuft.</p>
        <p class="src">Quelle: szigetfestival.com/tickets, Stand 23.11.2026. Preise steigen mit der Zeit.</p>
      </details>
    </section>`;

  view.querySelector('.infos').addEventListener('click', (e) => {
    if (e.target.closest('[data-act=tricount]')) editTricount(view);
  });
  const off = onChange(() => {
    const box = view.querySelector('#kasse');
    if (!box) return off();
    box.innerHTML = kasse();
  });
}

async function editTricount(view) {
  const res = await dialog({
    title: 'Tricount-Link',
    body: `
      <div class="form">
        <label for="tc">Link aus Tricount (Teilen → Link kopieren)</label>
        <input id="tc" name="link" type="url" inputmode="url" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="https://tricount.com/…" value="${esc(settings().tricount || '')}">
        <p class="hint">Den Link sehen nur wir sechs. Leer lassen und speichern löscht ihn.</p>
      </div>`,
    buttons: [{ label: 'Abbrechen', value: 'no' }, { label: 'Speichern', value: 'ok', primary: true }],
    validate: (f) => {
      const v = (f.link || '').trim();
      return !v || TRICOUNT.test(v) ? '' : 'Das ist kein Tricount-Link. Er beginnt mit https:// und enthält tricount.com.';
    },
  });
  if (res?.value !== 'ok') return;
  setSetting('tricount', res.fields.link.trim());
  const box = view.querySelector('#kasse');
  if (box) box.innerHTML = kasse();
  toast(res.fields.link.trim() ? 'Gespeichert – alle sechs sehen ihn.' : 'Link gelöscht.');
}
