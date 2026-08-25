import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cashtrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    // 1. Admin Login
    if (email === 'admin@cashtrack.com' && password === 'admin123') {
      const adminUser = { id: 'admin', name: 'Admin', role: 'admin', email, avatarColor: 'from-slate-400 to-slate-600' };
      setUser(adminUser);
      localStorage.setItem('cashtrack_user', JSON.stringify(adminUser));
      return { success: true };
    }
    
    // 2. Check localStorage for dynamically added team members
    try {
      const savedData = localStorage.getItem('cashtrack_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        const member = data.team?.find(u => u.email === email && u.password === password);
        if (member) {
          setUser({ ...member, role: 'member' });
          localStorage.setItem('cashtrack_user', JSON.stringify({ ...member, role: 'member' }));
          return { success: true };
        }
      }
    } catch (e) { console.error(e); }

    // 3. Fallback to dummy data for first-time load
    const teamMock = [
      { id: 'u1', name: 'Umer', role: 'member', email: 'umer@cashtrack.com', password: 'umer123', avatarColor: 'from-blue-400 to-indigo-500' },
      { id: 'u2', name: 'Laiba', role: 'member', email: 'laiba@cashtrack.com', password: 'laiba123', avatarColor: 'from-pink-400 to-rose-500' }
    ];
    const member = teamMock.find(m => m.email === email && m.password === password);
    if (member) {
      setUser(member);
      localStorage.setItem('cashtrack_user', JSON.stringify(member));
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