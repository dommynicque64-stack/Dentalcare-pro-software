import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

type Role = 'Admin' | 'Dentist' | 'Receptionist' | 'Accountant';
export interface User { id: string; email: string; name: string; role: Role; avatar?: string }
interface AuthCtx { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, login: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(AuthContext);

async function loadProfile() {
  const { data: { session } } = await supabase.auth.getSession();
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

    loadProfile()
      .then(profile => { if (mounted) setUser(profile); })
      .catch(() => { if (mounted) setUser(null); })
      .finally(() => { if (mounted) setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer network work so the Supabase auth callback is not blocked by another auth call.
      void (async () => {
      if (!mounted) return;
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth-me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error('No clinic role assigned');
        const payload = await response.json();
        if (mounted) setUser(payload.user as User);
      } catch {
        await supabase.auth.signOut();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
      })();
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);

    try {
      const profile = await loadProfile();
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
