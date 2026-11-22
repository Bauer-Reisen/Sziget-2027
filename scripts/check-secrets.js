// Prüft vor dem Hochladen, dass nichts Geheimes oder Privates im Repository landet.
// Aufruf: npm run check-secrets. Findet es etwas, bricht es ab.
// Prüft außerdem: Versionsnummern überall gleich, alle App-Dateien im Offline-Speicher (sw.js).
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const files = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n').filter(Boolean).filter((f) => !/\.(png|jpg|jpeg|ico|gif|webp|woff2)$/i.test(f));

// Namen der sechs aus der privaten Datei (nur Vornamen > 3 Buchstaben, als ganze Wörter)
const names = existsSync('worker/personen.sql')
  ? [...readFileSync('worker/personen.sql', 'utf8').matchAll(/\('[\w-]+',\s*'([^'&]+)',\s*'[\w-]+',\s*\d+/g)].map((m) => m[1].trim())
  : [];

const hits = [];
for (const f of files) {
  if (/(^|\/)\.dev\.vars$/.test(f)) hits.push(`${f}  →  Datei mit Test-Code darf nicht hoch`);
  if (/personen\.sql$/.test(f)) hits.push(`${f}  →  Namen der sechs dürfen nicht hoch`);
  let text; try { text = readFileSync(f, 'utf8'); } catch { continue; }
  text.split('\n').forEach((line, i) => {
    if (/GROUP_CODE\s*=\s*\S/.test(line) && !/^\s*#/.test(line)) hits.push(`${f}:${i + 1}  →  gemeinsamer Code im Text`);
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(line)) hits.push(`${f}:${i + 1}  →  privater Schlüssel`);
    if (f.startsWith('docs/') || f.startsWith('worker/')) {
      for (const n of names) if (new RegExp(`\\b${n}\\b`).test(line)) hits.push(`${f}:${i + 1}  →  Name „${n}"`);
    }
  });
}
if (hits.length) {
  console.error('\n✋ Möglicherweise Geheimes gefunden – bitte nicht hochladen:\n   ' + hits.join('\n   ') + '\n');
  process.exit(1);
}
console.log(`✓ Nichts Geheimes gefunden (${names.length} Namen geprüft).`);

const version = readFileSync('docs/js/config.js', 'utf8').match(/VERSION = '([^']+)'/)[1];
const wrong = [];
for (const f of files.filter((f) => /^docs\/js\/.+\.js$/.test(f))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/(?:from |import\()'(\.\/[^']+)'/g)) {
    if (!m[1].endsWith(`?v=${version}`)) wrong.push(`${f}: ${m[1]}`);
  }
}
const sw = readFileSync('docs/sw.js', 'utf8');
if (!sw.includes(`VERSION = '${version}'`)) wrong.push(`docs/sw.js: Version passt nicht zu ${version}`);
for (const f of readdirSync('docs/js').filter((f) => f.endsWith('.js'))) {
  if (!sw.includes(`'js/${f}'`)) wrong.push(`docs/sw.js: js/${f} fehlt im Offline-Speicher`);
}
// Wächter: Rundgang muss aktuell bleiben (jede Neuigkeit nennt ihre Karte oder ist „klein")
const { STEPS, NEWS } = await import('../docs/js/hilfe.js');
const num = (v) => v.split('.').map(Number);
const geq = (a, b) => { const x = num(a); const y = num(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return true; };
for (const n of NEWS) {
  if (n.karte === 'klein') continue;
  const s = STEPS.find((st) => st.id === n.karte);
  if (!s) wrong.push(`Was ist neu ${n.v}: keine Rundgang-Karte „${n.karte}" (oder karte: 'klein' setzen)`);
  else if (!geq(s.stand, n.v)) wrong.push(`Rundgang-Karte „${s.id}" hat stand ${s.stand}, muss mindestens ${n.v} sein`);
}
if (wrong.length) { console.error(`\n✋ Versionsfehler:\n   ${wrong.join('\n   ')}\n`); process.exit(1); }
console.log(`✓ Alle Importe und der Offline-Speicher tragen Version ${version}.`);
