import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Role, LoginResponse } from '../types/auth';

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [tokenType, setTokenType] = useState<string | null>(() => localStorage.getItem('tokenType'));
  const [expiresIn, setExpiresIn] = useState<number | null>(() => {
    const stored = localStorage.getItem('expiresIn');
    return stored ? Number(stored) : null;
  });
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [role, setRole] = useState<Role | null>(() => localStorage.getItem('role') as Role | null);

  const isAuthenticated = Boolean(token);

  const login = (data: LoginResponse) => {
    const accessToken = data.accessToken || data.token;
    localStorage.setItem('token', accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    else localStorage.removeItem('refreshToken');
    if (data.tokenType) localStorage.setItem('tokenType', data.tokenType);
    else localStorage.removeItem('tokenType');
    if (data.expiresIn !== undefined) localStorage.setItem('expiresIn', String(data.expiresIn));
    else localStorage.removeItem('expiresIn');
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    setToken(accessToken);
    setRefreshToken(data.refreshToken ?? null);
    setTokenType(data.tokenType ?? null);
    setExpiresIn(data.expiresIn ?? null);
    setUsername(data.username);
    setRole(data.role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setRefreshToken(null);
    setTokenType(null);
    setExpiresIn(null);
    setUsername(null);
    setRole(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedTokenType = localStorage.getItem('tokenType');
      const storedExpiresIn = localStorage.getItem('expiresIn');
      const storedUsername = localStorage.getItem('username');
      const storedRole = localStorage.getItem('role') as Role | null;
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setTokenType(storedTokenType);
      setExpiresIn(storedExpiresIn ? Number(storedExpiresIn) : null);
      setUsername(storedUsername);
      setRole(storedRole);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        tokenType,
        expiresIn,
        username,
        role,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
