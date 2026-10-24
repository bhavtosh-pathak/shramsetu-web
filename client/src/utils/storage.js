// Per-tab sessions.
// Each browser tab keeps its OWN login in sessionStorage, so two accounts can be open in two tabs
// and refreshing one tab never switches it to the other tab's account.
// localStorage only stores the "last login" so a brand-new tab can start logged in; that tab then
// copies it into its own sessionStorage (see adoptSharedSession) and stops depending on it.
const memory = {};
const area = name => { try { return window[name] || null; } catch { return null; } };
const session = () => area('sessionStorage');
const local = () => area('localStorage');
const read = (a, key) => { try { return a ? a.getItem(key) : null; } catch { return null; } };
const write = (a, key, value) => { try { a?.setItem(key, value); } catch { /* storage blocked or full */ } };
const drop = (a, key) => { try { a?.removeItem(key); } catch { /* ignore */ } };

export const storage = {
  get(key) { return read(session(), key) ?? read(local(), key) ?? memory[key] ?? null; },
  set(key, value) { const v = String(value); memory[key] = v; write(session(), key, v); write(local(), key, v); },
  remove(key) { delete memory[key]; drop(session(), key); drop(local(), key); },
  getJSON(key, fallback = null) {
    try { const raw = this.get(key); return raw ? JSON.parse(raw) : fallback; }
    catch { this.remove(key); return fallback; }
  },
  setJSON(key, value) { this.set(key, JSON.stringify(value)); }
};

export const TOKEN_KEY = 'shramsetu_token';
export const USER_KEY = 'shramsetu_user';

// Runs once when the tab loads: make this tab independent of the shared "last login".
export function adoptSharedSession() {
  const s = session();
  if (!s || read(s, TOKEN_KEY)) return;
  const token = read(local(), TOKEN_KEY);
  if (!token) return;
  write(s, TOKEN_KEY, token);
  const user = read(local(), USER_KEY);
  if (user) write(s, USER_KEY, user);
}
adoptSharedSession();

// Log this tab out. The shared "last login" is only cleared if it belongs to this tab,
// so logging out here does not wipe another tab's newer login.
export function clearSession() {
  const s = session(); const l = local();
  const mine = read(s, TOKEN_KEY) ?? memory[TOKEN_KEY];
  drop(s, TOKEN_KEY); drop(s, USER_KEY);
  delete memory[TOKEN_KEY]; delete memory[USER_KEY];
  if (!mine || read(l, TOKEN_KEY) === mine) { drop(l, TOKEN_KEY); drop(l, USER_KEY); }
}
