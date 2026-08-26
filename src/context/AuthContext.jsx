import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if someone is already logged in when page loads
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch their profile details
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser({ ...profile, role: profile?.role || 'member' });
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const login = async (email, password) => {
    // Special Admin Override (Since Admin isn't in the DB yet)
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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Function for Admin to create new team members
  const createTeamMember = async (email, password, name, role, avatarColor) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, avatar_color: avatarColor } // This sends data to our SQL Trigger!
      }
    });
    
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, createTeamMember, loading }}>
      {children}
    </AuthContext.Provider>
  );
};