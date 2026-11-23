// Feste Einstellungen der App. Hier steht nichts Geheimes.
export const VERSION = '0.5.0';

// Adresse des Workers (die Tür zu den geteilten Daten). Beim Testen am PC läuft er lokal.
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
export const API = LOCAL ? 'http://localhost:8789' : 'https://sziget.film-app.workers.dev';

export const APP_NAME = 'Insel 27';

// Festival: erster und letzter Tag (Ortszeit Budapest = deutsche Zeit)
export const FESTIVAL = { first: '2027-08-10', last: '2027-08-14', days: 5 };
// Ein Festivaltag geht von 6 Uhr morgens bis 5:59 Uhr am nächsten Morgen.
export const DAY_START_HOUR = 6;
export const FESTIVAL_DAYS = ['2027-08-10', '2027-08-11', '2027-08-12', '2027-08-13', '2027-08-14'];

// Woher das Line-up stammt (bei jeder neuen Welle anpassen)
export const LINEUP_STAND = 'Stand: 1. Welle vom 10.11.2026';
