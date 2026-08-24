import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Centralized mock database for V1
const MOCK_USERS = [
  { id: 'admin', name: 'Admin', role: 'admin', email: 'admin@cashtrack.com', password: 'admin123', avatarColor: 'from-slate-400 to-slate-600' },
  { id: 'u1', name: 'Umer', role: 'member', email: 'umer@cashtrack.com', password: 'umer123', avatarColor: 'from-blue-400 to-indigo-500' },
  { id: 'u2', name: 'Laiba', role: 'member', email: 'laiba@cashtrack.com', password: 'laiba123', avatarColor: 'from-pink-400 to-rose-500' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cashtrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser); // Instant state update triggers re-render
      localStorage.setItem('cashtrack_user', JSON.stringify(foundUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cashtrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};