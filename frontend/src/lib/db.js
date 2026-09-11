// ============================================================
// src/lib/db.js
// Shared localStorage-backed "database" layer for the whole app.
// Users, Experts and Visitors all live here so every page reads
// and writes the same data consistently.
// ============================================================

const KEYS = {
  USERS: "egaz_users",
  EXPERTS: "egaz_experts",
  VISITORS: "visitors", // kept as "visitors" to stay compatible with any old saved data
  SESSION: "egaz_session",
  TOKEN: "egaz_token",
};

const SEED_USERS = [
  {
    id: "u-1",
    fullname: "Admin",
    username: "admin",
    password: "admin",
    role: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "u-2",
    fullname: "Receptionist",
    username: "receptionist",
    password: "receptionist",
    role: "receptionist",
    created_at: new Date().toISOString(),
  },
];

const SEED_EXPERTS = [
  
];

export function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

// Base API URL (Vite env or default)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

async function apiRequest(path, options = {}) {
  try {
    const token = localStorage.getItem(KEYS.TOKEN);
    const headers = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const error = new Error(data?.message || 'Request failed');
      error.status = res.status;
      error.payload = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

async function safeFetch(path, opts = {}) {
  return apiRequest(path, opts);
}

function syncToApi(resource, payload) {
  if (typeof fetch === 'undefined') return payload;

  const storageKeyMap = {
    users: KEYS.USERS,
    experts: KEYS.EXPERTS,
    visitors: KEYS.VISITORS,
  };

  const safePayload = Array.isArray(payload) ? payload : [payload];
  write(storageKeyMap[resource] || KEYS.VISITORS, safePayload);

  apiRequest(`/${resource}`, {
    method: 'PUT',
    body: JSON.stringify(safePayload),
  }).catch(() => {});

  return safePayload;
}

export { API_BASE, safeFetch, apiRequest, syncToApi };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

// ---- USERS ----
export const getUsers = () => {
  const local = read(KEYS.USERS, SEED_USERS);

  if (typeof fetch !== 'undefined') {
    apiRequest('/users').then((serverUsers) => {
      if (Array.isArray(serverUsers) && serverUsers.length) {
        write(KEYS.USERS, serverUsers);
      }
    }).catch(() => {});
  }

  return local;
};

export const saveUsers = (list) => syncToApi('users', list);

// ---- EXPERTS ----
export const getExperts = () => {
  const local = read(KEYS.EXPERTS, SEED_EXPERTS);
  return local;
};

export async function refreshExperts() {
  const local = getExperts();

  try {
    const serverExperts = await apiRequest('/experts');
    if (Array.isArray(serverExperts) && (serverExperts.length || local.length === 0)) {
      return write(KEYS.EXPERTS, serverExperts);
    }
  } catch {
    // Keep the local copy when the backend is unavailable.
  }

  return local;
}

export const saveExperts = (list) => syncToApi('experts', list);

// ---- VISITORS ----
export const getVisitors = () => {
  return read(KEYS.VISITORS, []);
};

export async function refreshVisitors() {
  const local = getVisitors();

  try {
    const serverVisitors = await apiRequest('/visitors');
    if (Array.isArray(serverVisitors) && (serverVisitors.length || local.length === 0)) {
      return write(KEYS.VISITORS, serverVisitors);
    }
  } catch {
    // Keep the local copy when the backend is unavailable.
  }

  return local;
}

export const saveVisitors = (list) => syncToApi('visitors', list);

// ---- SESSION (who is currently logged in — persists across refresh) ----
export function getSession() {
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function setSession(user) {
  if (user) localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
  else localStorage.removeItem(KEYS.SESSION);
}

export { KEYS };
