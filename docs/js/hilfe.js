// Inhalte für Rundgang und „Was ist neu?" (ohne weitere Importe, damit der Wächter-Test sie lesen kann).
// Regel: Jeder „Was ist neu?"-Eintrag nennt die Rundgang-Karte, die die Neuerung erklärt (karte),
// oder ist ausdrücklich „klein". Die genannte Karte muss einen stand ≥ dieser Version haben.
// Geprüft vor jedem Hochladen von scripts/check-secrets.js.

export const STEPS = [
  {
    id: 'willkommen', stand: '0.1.0', icon: '🎪', title: 'Unsere Festival-App',
    text: 'Für uns sechs auf der Insel: wer wann was sehen will, wo wir uns treffen und was wichtig ist. Alles <strong>auch ohne Netz</strong> – auf dem Festival ist das Netz oft überlastet.',
  },
  {
    id: 'lineup', stand: '0.3.0', icon: '🎤', title: 'Line-up markieren',
    text: 'Im Reiter <strong>Line-up</strong> markierst du jeden Act mit <strong>Muss</strong>, <strong>Gern</strong> oder <strong>Egal</strong>. Tippst du auf einen Act, kommt sein <strong>Steckbrief</strong>: Musikrichtung, wie sie live sind (🔥 = Live-Tipp) und Songs zum Reinhören. Unter <strong>Gemeinsam</strong> siehst du, wen die meisten von uns sehen wollen.',
  },
  {
    id: 'infos', stand: '0.4.0', icon: 'ℹ️', title: 'Infos ohne Netz',
    text: 'Im Reiter <strong>Infos</strong>: Notrufnummern, Regeln, was mit darf, unsere <strong>gemeinsame Kasse</strong> (Tricount) und was bei Anreise und Camping am schlauesten ist.',
  },
  {
    id: 'heute', stand: '0.5.0', icon: '🗓️', title: 'Unser Tag',
    text: 'Im Reiter <strong>Heute</strong> siehst du für jeden Festivaltag, wer wann wo hin will, wo sich deine Acts <strong>überschneiden</strong> und wo wir uns treffen. Uhrzeiten trägst du im Line-up ein (Act antippen → Ändern), sobald der Zeitplan da ist.',
  },
  {
    id: 'offline', stand: '0.1.0', icon: '📶', title: 'Ohne Netz',
    text: 'Die App speichert sich selbst auf dem Handy. Auf der Startseite steht <strong>„Offline bereit ✓"</strong>, wenn alles da ist. Was du ohne Netz einträgst, wartet und geht raus, sobald wieder Netz da ist.',
  },
  {
    id: 'teilen', stand: '0.6.0', icon: '📲', title: 'App weitergeben',
    text: 'Unter <strong>Mehr → App weitergeben</strong> gibt es einen <strong>QR-Code</strong> zum Abscannen und einen Knopf zum Teilen per WhatsApp & Co. Den gemeinsamen Code sagst du persönlich – er steht absichtlich nicht im Link.',
  },
  {
    id: 'home', stand: '0.1.0', icon: '🏠', title: 'Auf den Home-Bildschirm',
    text: 'Wichtig, vor allem am iPhone: Nur als App auf dem Home-Bildschirm bleibt alles sicher gespeichert. Am iPhone in Safari auf das <strong>Teilen-Symbol</strong>, dann <strong>„Zum Home-Bildschirm"</strong>. Danach dort öffnen und einmal mit Netz anmelden.',
  },
];

// Neueste zuerst. Nur sichtbare Neuerungen, keine Reparaturen.
export const NEWS = [
  {
    v: '0.6.0', karte: 'teilen', title: 'App weitergeben',
    items: [
      'Unter <strong>Mehr</strong> gibt es jetzt einen <strong>QR-Code</strong>: die anderen scannen ihn einfach mit der Kamera ab.',
      'Oder <strong>„Link teilen"</strong> tippen und per WhatsApp, Mail & Co. schicken.',
      'Den gemeinsamen Code sagst du persönlich – er steht absichtlich nicht im Link.',
    ],
  },
  {
    v: '0.5.1', karte: 'klein', title: 'Neues App-Symbol',
    items: [
      'Die App hat ein buntes neues Symbol: Sonnenuntergang über der Insel.',
      'Auf dem iPhone erscheint es erst, wenn du die App einmal vom Home-Bildschirm löschst und neu hinzufügst (Teilen → Zum Home-Bildschirm).',
    ],
  },
  {
    v: '0.5.0', karte: 'heute', title: 'Neuer Reiter: Heute',
    items: [
      'Unter <strong>Heute</strong> steht für jeden Festivaltag, wer wann wo hin will – mit Namen.',
      'Überschneiden sich zwei deiner Acts, steht dort eine <strong>Warnung</strong>.',
      '<strong>Treffpunkt</strong> pro Tag und ein fester <strong>Plan B</strong>, falls sich jemand verliert.',
      'Bühne und Uhrzeit trägst du im Line-up ein: Act antippen → Ändern. Der echte Zeitplan kommt etwa im Juni.',
    ],
  },
  {
    v: '0.4.0', karte: 'infos', title: 'Neuer Reiter: Infos',
    items: [
      'Unten gibt es jetzt <strong>Infos</strong>: Notrufnummern, Hilfe auf dem Gelände und die Deutsche Botschaft.',
      'Ticket und Regeln: was mit darf und was nicht.',
      '<strong>Gemeinsame Kasse:</strong> Eine Person fügt den Tricount-Link ein, dann haben ihn alle sechs.',
      'Dazu die Analysen: Wie anreisen? Welcher Camping-Bereich?',
    ],
  },
  {
    v: '0.3.0', karte: 'lineup', title: 'Steckbriefe zu jedem Act',
    items: [
      'Jeder Act hat jetzt ein <strong>Bild</strong> und die <strong>Musikrichtung</strong>.',
      'Tippe auf einen Act: Herkunft, kurz erklärt, <strong>wie sie live sind</strong> und ihre bekanntesten Songs – direkt zum Reinhören in Spotify.',
      '<strong>🔥 Live-Tipp</strong> heißt: Die Kritiker sagen, die Show reißt richtig mit. Oben kannst du nur die Live-Tipps anzeigen.',
    ],
  },
  {
    v: '0.2.0', karte: 'lineup', title: 'Das Line-up ist da',
    items: [
      'Unten gibt es den neuen Reiter <strong>Line-up</strong> mit den ersten 20 Acts.',
      'Tippe bei jedem Act <strong>Muss</strong>, <strong>Gern</strong> oder <strong>Egal</strong>. Unter <strong>Gemeinsam</strong> steht oben, wen die meisten von uns sehen wollen.',
      'Fehlt ein Act? Unten auf <strong>„+ Act eintragen"</strong>. Klappt auch ohne Netz.',
    ],
  },
];
