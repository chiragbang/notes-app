'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Store user info (optional)
  const [token, setToken] = useState(null);
  const [isLoading, setisLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Optionally decode token or fetch user info
      // For simplicity, we'll just mark user as logged in
      setUser({}); 
    }
    setisLoading(false)
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser({}); // set actual user info if you have
    router.push("/dashboard")
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context easily
export function useAuth() {
  return useContext(AuthContext);
}
