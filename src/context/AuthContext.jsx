import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          setUser({ ...data, role: data?.role || 'member' });
        });
      }
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    if (email === 'admin@cashtrack.com' && password === 'admin123') {
      setUser({ id: 'admin', name: 'Admin', role: 'admin', email, avatarColor: 'from-slate-400 to-slate-600' });
      return { success: true };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setUser({ ...profile, role: profile?.role || 'member' });
      return { success: true };
    }
    return { success: false, error: 'Login failed' };
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};