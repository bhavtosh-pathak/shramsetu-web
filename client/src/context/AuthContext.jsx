import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { storage, TOKEN_KEY, USER_KEY, clearSession } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => (storage.get(TOKEN_KEY) ? storage.getJSON(USER_KEY, null) : null));
  const [loading, setLoading] = useState(() => Boolean(storage.get(TOKEN_KEY)));

  // single place that keeps React state and storage in sync
  const setUser = useCallback(next => {
    setUserState(next);
    if (next) storage.setJSON(USER_KEY, next); else storage.remove(USER_KEY);
  }, []);

  useEffect(() => {
    let active = true;
    if (!storage.get(TOKEN_KEY)) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => { if (active) setUser(data.user); })
      .catch(err => {
        if (!active) return;
        // only drop the session when the server says the token is invalid, not on network errors
        if (err.response?.status === 401) { clearSession(); setUserState(null); }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [setUser]);

  const saveSession = useCallback(data => { storage.set(TOKEN_KEY, data.token); setUser(data.user); }, [setUser]);
  const login = useCallback(async credentials => { const { data } = await api.post('/auth/login', credentials); saveSession(data); return data.user; }, [saveSession]);
  const register = useCallback(async values => { const { data } = await api.post('/auth/register', values); saveSession(data); return data.user; }, [saveSession]);
  const logout = useCallback(() => { clearSession(); setUserState(null); window.location.assign('/'); }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout, setUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
