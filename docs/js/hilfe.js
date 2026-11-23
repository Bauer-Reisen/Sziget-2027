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
    id: 'heute', stand: '0.1.0', icon: '🗓️', title: 'Unser Tag',
    text: 'Sobald der Zeitplan erscheint (ungefähr im Juni), macht die App daraus einen <strong>Plan für jeden Tag</strong>: wer ist wann wo, wo gibt es Überschneidungen, wo treffen wir uns.',
  },
  {
    id: 'offline', stand: '0.1.0', icon: '📶', title: 'Ohne Netz',
    text: 'Die App speichert sich selbst auf dem Handy. Auf der Startseite steht <strong>„Offline bereit ✓"</strong>, wenn alles da ist. Was du ohne Netz einträgst, wartet und geht raus, sobald wieder Netz da ist.',
  },
  {
    id: 'home', stand: '0.1.0', icon: '🏠', title: 'Auf den Home-Bildschirm',
    text: 'Wichtig, vor allem am iPhone: Nur als App auf dem Home-Bildschirm bleibt alles sicher gespeichert. Am iPhone in Safari auf das <strong>Teilen-Symbol</strong>, dann <strong>„Zum Home-Bildschirm"</strong>. Danach dort öffnen und einmal mit Netz anmelden.',
  },
];

// Neueste zuerst. Nur sichtbare Neuerungen, keine Reparaturen.
export const NEWS = [
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
