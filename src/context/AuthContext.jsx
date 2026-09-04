import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cashtrack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Admin override
    if (email === 'admin@cashtrack.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin',
        name: 'Admin',
        role: 'admin',
        email,
        avatarColor: 'from-slate-400 to-slate-600'
      };
      setUser(adminUser);
      localStorage.setItem('cashtrack_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // Check if user exists in localStorage profiles
    const savedData = localStorage.getItem('cashtrack_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      const foundUser = data.profiles?.find(p => p.email === email);
      
      if (foundUser) {
        // For local demo, accept any password
        setUser(foundUser);
        localStorage.setItem('cashtrack_user', JSON.stringify(foundUser));
        return { success: true };
      }
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('cashtrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};