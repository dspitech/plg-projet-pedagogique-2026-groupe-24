import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'global_admin' | 'admin' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_suspended: boolean;
  must_change_password: boolean;
  last_login: string | null;
  created_at: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  permissions: string[]; // "resource:action"
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (uid: string) => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    setProfile(prof as Profile | null);

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', uid);
    const userRoles = (rolesData ?? []).map((r) => r.role as AppRole);
    setRoles(userRoles);

    if (userRoles.length > 0) {
      const { data: perms } = await supabase
        .from('role_permissions')
        .select('permissions(resource,action)')
        .in('role', userRoles);
      const flat = (perms ?? [])
        .map((rp: any) => rp.permissions)
        .filter(Boolean)
        .map((p: any) => `${p.resource}:${p.action}`);
      setPermissions(Array.from(new Set(flat)));
    } else {
      setPermissions([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (user) await loadUserData(user.id);
  }, [user, loadUserData]);

  useEffect(() => {
    // CRITICAL: set listener BEFORE getSession
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer to avoid deadlock
        setTimeout(() => {
          loadUserData(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
        setPermissions([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadUserData(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
      await supabase.rpc('log_audit_event', {
        _action: 'login',
        _resource: 'auth',
        _resource_id: data.user.id,
        _details: {},
      });
    }
    return { error: null };
  };

  const signOut = async () => {
    if (user) {
      await supabase.rpc('log_audit_event', {
        _action: 'logout',
        _resource: 'auth',
        _resource_id: user.id,
        _details: {},
      });
    }
    await supabase.auth.signOut();
  };

  const hasRole = (r: AppRole) => roles.includes(r);
  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete') =>
    hasRole('global_admin') || permissions.includes(`${resource}:${action}`);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, roles, permissions, loading, hasRole, hasPermission, signIn, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
