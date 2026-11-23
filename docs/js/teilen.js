// „App weitergeben": QR-Code zum Abscannen und Teilen-Knopf (WhatsApp, Mail …).
// Weitergegeben wird nur der Link. Der gemeinsame Code steht absichtlich nicht drin – den sagt man persönlich.
import { toast } from './ui.js?v=0.6.0';

const LINK = 'https://bauer-reisen.github.io/Sziget-2027/';
const TEXT = 'Unsere Festival-App für Sziget 2027 – öffnen, zum Home-Bildschirm hinzufügen, dann den gemeinsamen Code eingeben (sag ich dir persönlich):';

export function shareCard() {
  return `
    <div class="card share">
      <h3>App weitergeben</h3>
      <p>Lass die anderen den QR-Code mit der Handy-Kamera abscannen oder schick ihnen den Link.</p>
      <img class="qr" src="icons/qr.svg" alt="QR-Code mit dem Link zur App" width="220" height="220">
      <button type="button" class="btn btn-primary btn-wide" data-act="share">Link teilen</button>
      <p class="hint">Der <strong>gemeinsame Code</strong> steht nicht im Link – den sagst du persönlich. So kommt niemand Fremdes hinein, auch wenn der Link weitergeleitet wird.</p>
    </div>`;
}

export function wireShare(view) {
  view.querySelector('[data-act=share]')?.addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Insel 27', text: TEXT, url: LINK }); } catch { /* abgebrochen */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${TEXT} ${LINK}`);
      toast('Link kopiert – jetzt z. B. in WhatsApp einfügen.');
    } catch {
      toast(LINK, 6000);
    }
  });
}
