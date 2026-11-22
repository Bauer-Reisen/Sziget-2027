// Kleiner Speicher auf dem Handy (localStorage). Klappt auch im privaten Modus ohne Absturz.
const KEY = 'insel.';
export const store = {
  get: (k) => { try { return localStorage.getItem(KEY + k); } catch { return null; } },
  set: (k, v) => { try { v == null ? localStorage.removeItem(KEY + k) : localStorage.setItem(KEY + k, v); } catch { /* voll/privat */ } },
  getJson: (k) => { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch { return null; } },
  setJson: (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* voll/privat */ } },
};
