import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'guru' | 'ortu' | 'santri' | 'muhafizh' | 'guest';

interface UserWithRole {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userRole: UserRole | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Role mappings from old system to new
const mapOldRoleToNew = (oldRole: string): UserRole => {
  switch (oldRole) {
    case 'student': return 'santri';
    case 'teacher': return 'guru';
    case 'parent': return 'ortu';
    case 'admin': return 'admin';
    case 'muhafizh': return 'muhafizh';
    default: 
      if (['santri', 'guru', 'ortu', 'admin', 'muhafizh'].includes(oldRole)) {
        return oldRole as UserRole;
      }
      return 'santri';
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isGuest = username === 'guest';

  useEffect(() => {
    const authStatus = localStorage.getItem('kdm_auth');
    const savedUser = localStorage.getItem('kdm_user');
    const savedRole = localStorage.getItem('kdm_user_role');
    
    if (authStatus === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUsername(savedUser);
      setUserRole(savedRole as UserRole || null);
    }
    setIsLoading(false);
  }, []);

  const login = (inputUsername: string, inputPassword: string): boolean => {
    // Check against dynamically created users from localStorage
    const storedUsers = localStorage.getItem('kdm_users_roles');
    
    if (storedUsers) {
      const users: UserWithRole[] = JSON.parse(storedUsers);
      const foundUser = users.find(
        u => u.username.toLowerCase() === inputUsername.toLowerCase() && u.password === inputPassword
      );
      
      if (foundUser) {
        // Map old role names to new ones
        const mappedRole = mapOldRoleToNew(foundUser.role);
        
        setIsAuthenticated(true);
        setUsername(foundUser.username);
        setUserRole(mappedRole);
        localStorage.setItem('kdm_auth', 'true');
        localStorage.setItem('kdm_user', foundUser.username);
        localStorage.setItem('kdm_user_role', mappedRole);
        return true;
      }
    }

    // Fallback: Admin account
    if (inputUsername === 'admin' && inputPassword === 'admin123') {
      setIsAuthenticated(true);
      setUsername(inputUsername);
      setUserRole('admin');
      localStorage.setItem('kdm_auth', 'true');
      localStorage.setItem('kdm_user', inputUsername);
      localStorage.setItem('kdm_user_role', 'admin');
      return true;
    }

    // Fallback: Guest account
    if (inputUsername === 'guest' && inputPassword === 'guest123') {
      setIsAuthenticated(true);
      setUsername(inputUsername);
      setUserRole('guest');
      localStorage.setItem('kdm_auth', 'true');
      localStorage.setItem('kdm_user', inputUsername);
      localStorage.setItem('kdm_user_role', 'guest');
      return true;
    }
    
    // Fallback: Demo accounts
    const demoAccounts = [
      'demopesantren',
      'demopesantren1',
      'demopesantren2',
      'demopesantren3',
      'demopesantren4',
    ];
    
    if (demoAccounts.includes(inputUsername) && inputPassword === 'freeplan') {
      setIsAuthenticated(true);
      setUsername(inputUsername);
      setUserRole('admin');
      localStorage.setItem('kdm_auth', 'true');
      localStorage.setItem('kdm_user', inputUsername);
      localStorage.setItem('kdm_user_role', 'admin');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setUserRole(null);
    localStorage.removeItem('kdm_auth');
    localStorage.removeItem('kdm_user');
    localStorage.removeItem('kdm_user_role');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, userRole, isGuest, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
