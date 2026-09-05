import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

type Role = 'Admin' | 'Dentist' | 'Receptionist' | 'Accountant';
export interface User { id: string; email: string; name: string; role: Role; avatar?: string }
interface AuthCtx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, login: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(AuthContext);

async function loadProfile(session: { access_token: string } | null) {
  if (!session) return null;

  const response = await fetch('/api/auth-me', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!response.ok) {
    await supabase.auth.signOut();
    throw new Error('Your account does not have an active clinic role. Ask an administrator to assign one.');
  }
  const payload = await response.json();
  return payload.user as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let loadingProfile = false;

    const applySession = async (session: { access_token: string } | null) => {
      if (!mounted || loadingProfile) return;

      loadingProfile = true;
      try {
        const profile = await loadProfile(session);
        if (mounted) setUser(profile);
      } catch {
        if (mounted) setUser(null);
      } finally {
        loadingProfile = false;
        if (mounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const profile = await loadProfile(session);
      setUser(profile);
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
