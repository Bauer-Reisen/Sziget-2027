// Reiterleiste unten. Weitere Reiter (Heute, Infos) kommen mit den nächsten Abschnitten.
import { esc } from './ui.js?v=0.3.0';

const ICON = {
  start: '<circle cx="12" cy="13" r="4.5"/><path d="M12 3v2.5M4.9 6.4l1.8 1.8M19.1 6.4l-1.8 1.8M3 20h18"/>',
  lineup: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  mehr: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
};
const TAB_OF = { '': 'start', lineup: 'lineup', mehr: 'mehr' };

export function renderTabs(page) {
  const nav = document.getElementById('tabs');
  if (!nav) return;
  const active = TAB_OF[page] || 'start';
  const tabs = [
    ['start', 'Start', '#/'],
    ['lineup', 'Line-up', '#/lineup'],
    ['mehr', 'Mehr', '#/mehr'],
  ];
  nav.innerHTML = tabs.map(([id, label, href]) => `
    <a href="${esc(href)}" ${id === active ? 'aria-current="page"' : ''}>
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICON[id]}</svg>
      <span>${label}</span>
    </a>`).join('');
  nav.hidden = false;
  document.body.classList.add('has-tabs');
}

export function hideTabs() {
  const nav = document.getElementById('tabs');
  if (nav) nav.hidden = true;
  document.body.classList.remove('has-tabs');
}
