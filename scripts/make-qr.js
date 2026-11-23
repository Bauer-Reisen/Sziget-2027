// Erzeugt den QR-Code mit dem Link zur App (docs/icons/qr.svg). Aufruf: node scripts/make-qr.js
// Im QR steht NUR der Link – der gemeinsame Code wird persönlich weitergegeben.
import QRCode from 'qrcode';
import { writeFileSync } from 'node:fs';

const URL_APP = 'https://bauer-reisen.github.io/Sziget-2027/';
const svg = await QRCode.toString(URL_APP, { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#1b163a', light: '#ffffff' } });
writeFileSync(new URL('../docs/icons/qr.svg', import.meta.url), svg);
console.log('QR-Code erstellt:', URL_APP);
