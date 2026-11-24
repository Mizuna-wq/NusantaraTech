import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Saat halaman dibuka, cek apakah token yang tersimpan masih valid
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  async function authenticate(path, body) {
    const res = await api(path, { method: 'POST', body });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  const login = (email, password, role = 'candidate', companyId = '') =>
    authenticate('/auth/login', { email, password, role, company_id: companyId });

  const register = (fields) => authenticate('/auth/register', fields);

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
