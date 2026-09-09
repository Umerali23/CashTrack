import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = 'http://localhost/cashtrack-api/api.php';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cashtrack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const userData = {
          id: result.data.id,
          name: result.data.name,
          role: result.data.role,
          email: result.data.email,
          avatarColor: result.data.avatar_color
        };
        setUser(userData);
        localStorage.setItem('cashtrack_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: result.error || 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
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