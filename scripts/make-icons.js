// Erzeugt die App-Icons als PNG (ohne Zusatzpakete). Aufruf: node scripts/make-icons.js
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
// Motiv: Sonnenuntergang hinter der Insel in der Donau – bunte Strahlen, grüne Insel, Wellen.
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const TOP = [0xff, 0x3d, 0x8b];   // Pink
const LOW = [0xff, 0x9a, 0x3c];   // Orange am Horizont
const SUN = [0xff, 0xd8, 0x4d];
const RING = [0xff, 0xf3, 0xb0];
const ISLAND = [0x16, 0xb0, 0x7a];
const ISLAND_DARK = [0x0f, 0x7d, 0x5a];
const WATER = [0x2b, 0x1f, 0x6e];
const WAVE = [0x3e, 0xd9, 0xd0];
const H = 330; // Horizont

const hill = (x) => H - 78 * Math.sqrt(Math.max(0, 1 - ((x - 256) / 170) ** 2));

function colorAt(x, y) {
  // Wasser mit zwei Wellen
  if (y > H + 6) {
    const w = (y0) => y0 + 10 * Math.sin((x / 512) * Math.PI * 5);
    if (Math.abs(y - w(H + 62)) <= 10 || Math.abs(y - w(H + 118)) <= 10) return WAVE;
    return mix(WATER, [0x1b, 0x16, 0x3a], Math.min(1, (y - H) / 220));
  }
  // Insel vor der Sonne
  if (Math.abs(x - 256) < 170 && y >= hill(x)) return y > hill(x) + 22 ? ISLAND_DARK : ISLAND;
  // Sonne
  const d = Math.hypot(x - 256, y - (H - 40));
  if (d <= 92) return SUN;
  if (d <= 104) return RING;
  // Himmel: Verlauf + Strahlen
  const sky = mix(TOP, LOW, Math.max(0, Math.min(1, (y + 40) / (H + 40))));
  const ang = Math.atan2(y - (H - 40), x - 256);
  const ray = Math.floor((ang + Math.PI) / (Math.PI / 9)) % 2 === 0;
  return ray ? mix(sky, [0xff, 0xff, 0xff], 0.22) : sky;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, padding = 0) {
  const SS = 3; // Kantenglättung
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const scale = (512 + 2 * padding) / size;
  for (let py = 0; py < size; py++) {
    raw[py * (size * 3 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      const sum = [0, 0, 0];
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = (px + (sx + 0.5) / SS) * scale - padding;
        const y = (py + (sy + 0.5) / SS) * scale - padding;
        const c = colorAt(x, y);
        for (let i = 0; i < 3; i++) sum[i] += c[i];
      }
      const o = py * (size * 3 + 1) + 1 + px * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(sum[i] / (SS * SS));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = new URL('../docs/icons/', import.meta.url);
mkdirSync(dir, { recursive: true });
writeFileSync(new URL('apple-touch-icon.png', dir), png(180));
writeFileSync(new URL('icon-192.png', dir), png(192));
writeFileSync(new URL('icon-512.png', dir), png(512));
writeFileSync(new URL('icon-maskable-512.png', dir), png(512, 80)); // mit Rand für Android-Formen
writeFileSync(new URL('favicon-64.png', dir), png(64));
console.log('Icons erstellt in docs/icons/');
