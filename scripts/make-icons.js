// Erzeugt die App-Icons aus dem offiziellen Sziget-App-Symbol (scripts/sziget-logo.svg,
// geladen am 24.11.2026 von szigetfestival.com – nur für unsere private App).
// Aufruf: node scripts/make-icons.js
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const src = readFileSync(new URL('sziget-logo.svg', import.meta.url), 'utf8');
const mark = [...src.matchAll(/<path class="st0" d="([^"]+)"/g)].map((m) => m[1]);
if (!mark.length) throw new Error('Sziget-Zeichen im Logo nicht gefunden');

// Quadratisch und randlos rot (iPhone schneidet selbst rund), Zeichen mittig; scale < 1 = mehr Rand
const square = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#e4002d"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)" fill="#f4efe9">
    ${mark.map((d) => `<path d="${d}"/>`).join('\n    ')}
  </g>
</svg>`;

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
const dir = new URL('../docs/icons/', import.meta.url);
const normal = square(1.15);   // das Zeichen etwas größer als im runden Original
const maskable = square(0.9);  // Android schneidet Formen aus → mehr Rand
writeFileSync(new URL('apple-touch-icon.png', dir), png(normal, 180));
writeFileSync(new URL('icon-192.png', dir), png(normal, 192));
writeFileSync(new URL('icon-512.png', dir), png(normal, 512));
writeFileSync(new URL('icon-maskable-512.png', dir), png(maskable, 512));
writeFileSync(new URL('favicon-64.png', dir), png(normal, 64));
console.log('Icons aus dem Sziget-Logo erstellt in docs/icons/');
