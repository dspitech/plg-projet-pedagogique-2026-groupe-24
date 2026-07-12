import { useEffect, useState, useCallback } from 'react';

export interface HistoryEntry {
  scriptId: string;
  action: 'view' | 'download' | 'share' | 'favorite';
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarColor: string;
}

const KEYS = {
  favorites: 'app.favorites',
  downloads: 'app.downloads',
  shares: 'app.shares',
  history: 'app.history',
  profile: 'app.profile',
  auth: 'app.auth',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('userdata:update'));
}

export function useUserData() {
  const [favorites, setFavorites] = useState<string[]>(() => read(KEYS.favorites, []));
  const [downloads, setDownloads] = useState<string[]>(() => read(KEYS.downloads, []));
  const [shares, setShares] = useState<string[]>(() => read(KEYS.shares, []));
  const [history, setHistory] = useState<HistoryEntry[]>(() => read(KEYS.history, []));

  useEffect(() => {
    const sync = () => {
      setFavorites(read(KEYS.favorites, []));
      setDownloads(read(KEYS.downloads, []));
      setShares(read(KEYS.shares, []));
      setHistory(read(KEYS.history, []));
    };
    window.addEventListener('userdata:update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('userdata:update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const pushHistory = useCallback((scriptId: string, action: HistoryEntry['action']) => {
    const current = read<HistoryEntry[]>(KEYS.history, []);
    const next = [{ scriptId, action, timestamp: Date.now() }, ...current].slice(0, 100);
    write(KEYS.history, next);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const current = read<string[]>(KEYS.favorites, []);
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    write(KEYS.favorites, next);
    pushHistory(id, 'favorite');
  }, [pushHistory]);

  const addDownload = useCallback((id: string) => {
    const current = read<string[]>(KEYS.downloads, []);
    if (!current.includes(id)) write(KEYS.downloads, [id, ...current]);
    pushHistory(id, 'download');
  }, [pushHistory]);

  const addShare = useCallback((id: string) => {
    const current = read<string[]>(KEYS.shares, []);
    if (!current.includes(id)) write(KEYS.shares, [id, ...current]);
    pushHistory(id, 'share');
  }, [pushHistory]);

  const clearHistory = useCallback(() => write(KEYS.history, []), []);

  return {
    favorites,
    downloads,
    shares,
    history,
    isFavorite: (id: string) => favorites.includes(id),
    toggleFavorite,
    addDownload,
    addShare,
    pushHistory,
    clearHistory,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    read<UserProfile>(KEYS.profile, {
      name: 'Admin Cloud',
      email: 'admin@cloudscripts.io',
      role: 'Cloud Administrator',
      avatarColor: '199 89% 48%',
    })
  );
  useEffect(() => {
    const sync = () => setProfile(read(KEYS.profile, profile));
    window.addEventListener('userdata:update', sync);
    return () => window.removeEventListener('userdata:update', sync);
  }, [profile]);

  const updateProfile = (next: Partial<UserProfile>) => {
    const merged = { ...profile, ...next };
    write(KEYS.profile, merged);
    setProfile(merged);
  };
  return { profile, updateProfile };
}

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => read(KEYS.auth, true));
  useEffect(() => {
    const sync = () => setIsAuthed(read(KEYS.auth, true));
    window.addEventListener('userdata:update', sync);
    return () => window.removeEventListener('userdata:update', sync);
  }, []);
  const logout = () => {
    write(KEYS.auth, false);
    setIsAuthed(false);
  };
  const login = () => {
    write(KEYS.auth, true);
    setIsAuthed(true);
  };
  return { isAuthed, logout, login };
}
