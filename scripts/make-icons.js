// Erzeugt die App-Icons als PNG (ohne Zusatzpakete). Aufruf: node scripts/make-icons.js
// Motiv: Sonne über Wellen (die Insel in der Donau) auf Nachthimmel.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const NIGHT = [0x1b, 0x16, 0x3a];
const SUN = [0xff, 0xc8, 0x57];
const CORAL = [0xff, 0x6b, 0x5a];
const WAVE = [0x3e, 0xc9, 0xb6];

// Farbe an Stelle (x, y) im 512er-Raster
function colorAt(x, y) {
  const wave = (y0) => y0 + 14 * Math.sin((x / 512) * Math.PI * 4);
  if (Math.abs(y - wave(372)) <= 11) return WAVE;
  if (Math.abs(y - wave(420)) <= 11) return WAVE;
  const d = Math.hypot(x - 256, y - 300);
  if (y < wave(372) - 22 && d <= 150) return d <= 112 ? SUN : CORAL;
  return NIGHT;
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
const wavePath = (y0) => {
  let d = `M0 ${y0}`;
  for (let x = 16; x <= 512; x += 16) d += ` L${x} ${(y0 + 14 * Math.sin((x / 512) * Math.PI * 4)).toFixed(1)}`;
  return d;
};
writeFileSync(new URL('icon.svg', dir), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><clipPath id="c"><rect width="512" height="340"/></clipPath></defs><rect width="512" height="512" rx="96" fill="#1b163a"/><g clip-path="url(#c)"><circle cx="256" cy="300" r="150" fill="#ff6b5a"/><circle cx="256" cy="300" r="112" fill="#ffc857"/></g><g fill="none" stroke="#3ec9b6" stroke-width="22" stroke-linecap="round"><path d="${wavePath(372)}"/><path d="${wavePath(420)}"/></g></svg>\n`);
console.log('Icons erstellt in docs/icons/');
