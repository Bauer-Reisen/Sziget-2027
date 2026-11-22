// Verbindung zum Worker. Der Ausweis (Token) liegt nur auf diesem Handy.
import { API } from './config.js?v=0.1.0';
import { store } from './store.js?v=0.1.0';

export const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

export function deviceId() {
  let id = store.get('device');
  if (!id) { id = newId().slice(0, 18); store.set('device', id); }
  return id;
}

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function call(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = store.get('token');
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const person = store.get('person');
  if (person) headers['X-Person'] = person;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'Gerade kein Netz.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) store.set('token', null); // Ausweis abgelaufen oder Code geändert
    throw new ApiError(res.status, data.error || `Fehler ${res.status}`);
  }
  return data;
}

export async function login(code) {
  const { token } = await call('/api/login', { method: 'POST', body: { code, device: deviceId() }, auth: false });
  store.set('token', token);
}

export const loggedIn = () => Boolean(store.get('token'));
export const logout = () => { store.set('token', null); store.set('person', null); store.set('people', null); };

// Die sechs Personen: zuerst die Kopie auf dem Handy (geht offline), dann frisch vom Worker.
export const cachedPeople = () => store.getJson('people');
export async function fetchPeople() {
  const people = await call('/api/people');
  store.setJson('people', people);
  return people;
}
