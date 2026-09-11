import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, setSession, getUsers, KEYS, API_BASE } from '../lib/db';

async function apiLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE.replace(/\/api$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // becomes true once we've checked for a saved session
  const [loading, setLoading] = useState(false);

  // Restore session on first load so refreshing the page doesn't log you out
  useEffect(() => {
    setUser(getSession());
    setReady(true);
  }, []);

  const login = (username, password) => {
    setLoading(true);
    return new Promise(async (resolve) => {
      // Try backend first
      const apiRes = await apiLogin(username, password);
      if (apiRes && apiRes.token) {
        const authenticatedUser = { id: apiRes.userId, username: apiRes.username, name: apiRes.username, role: apiRes.role };
        localStorage.setItem(KEYS.TOKEN, apiRes.token);
        setSession(authenticatedUser);
        setUser(authenticatedUser);
        setLoading(false);
        resolve(authenticatedUser);
        return;
      }

      // Fallback to local storage seed auth
      setTimeout(() => {
        const users = getUsers();
        const normalizedUsername = username.trim().toLowerCase();
        const account = users.find(
          (u) => u.username.toLowerCase() === normalizedUsername && u.password === password
        );

        if (account) {
          const authenticatedUser = {
            id: account.id,
            username: account.username,
            name: account.fullname,
            role: account.role,
          };

          setSession(authenticatedUser);
          setUser(authenticatedUser);
          setLoading(false);
          resolve(authenticatedUser);
          return;
        }

        setUser(null);
        setLoading(false);
        resolve(null);
      }, 200);
    });
  };

  const logout = () => {
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
