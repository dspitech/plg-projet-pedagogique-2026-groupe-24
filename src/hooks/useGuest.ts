import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GuestIdentity {
  id: string;
  pseudo: string;
}

const STORAGE_KEY = 'app.guest';

function readGuest(): GuestIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestIdentity;
    if (parsed && typeof parsed.id === 'string' && typeof parsed.pseudo === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeGuest(g: GuestIdentity | null) {
  if (g) localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('guest:update'));
}

export const PSEUDO_REGEX = /^[A-Za-z0-9_.-]+$/;

export function validatePseudo(pseudo: string): string | null {
  const p = pseudo.trim();
  if (p.length < 6) return 'Le pseudo doit contenir au moins 6 caractères.';
  if (p.length > 30) return 'Le pseudo doit contenir au maximum 30 caractères.';
  if (!PSEUDO_REGEX.test(p)) return 'Caractères autorisés : lettres, chiffres, _ . -';
  return null;
}

export async function isPseudoAvailable(pseudo: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_pseudo_available', { _pseudo: pseudo.trim() });
  if (error) return false;
  return Boolean(data);
}

export async function registerGuest(pseudo: string): Promise<GuestIdentity> {
  const { data, error } = await supabase.rpc('register_guest', { _pseudo: pseudo.trim() });
  if (error) {
    const msg = error.message || '';
    if (msg.includes('pseudo_taken')) throw new Error('Ce pseudo est déjà utilisé.');
    if (msg.includes('pseudo_too_short')) throw new Error('Le pseudo doit contenir au moins 6 caractères.');
    if (msg.includes('pseudo_too_long')) throw new Error('Le pseudo doit contenir au maximum 30 caractères.');
    if (msg.includes('pseudo_invalid_chars')) throw new Error('Caractères autorisés : lettres, chiffres, _ . -');
    if (msg.includes('rate_limited')) throw new Error('Trop de créations. Réessayez plus tard.');
    throw new Error("Impossible d'enregistrer le pseudo.");
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) throw new Error("Impossible d'enregistrer le pseudo.");
  const identity: GuestIdentity = { id: row.id, pseudo: row.pseudo };
  writeGuest(identity);
  return identity;
}

export function useGuest() {
  const [guest, setGuest] = useState<GuestIdentity | null>(() => readGuest());

  useEffect(() => {
    const sync = () => setGuest(readGuest());
    window.addEventListener('guest:update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('guest:update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const clearGuest = useCallback(() => writeGuest(null), []);

  return { guest, setGuest: (g: GuestIdentity) => writeGuest(g), clearGuest };
}
