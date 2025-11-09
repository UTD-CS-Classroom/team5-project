import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerLogin, businessLogin, getCustomerProfile, getBusinessProfile } from '../lib/api';
import type { LoginResponse } from '../lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'customer' | 'business' | null;
  userId: number | null;
  token: string | null;
  user: any | null;
  loading: boolean;
  login: (email: string, password: string, type: 'customer' | 'business') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'business' | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate and restore session on mount
  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUserType = localStorage.getItem('userType') as 'customer' | 'business' | null;
      const savedUserId = localStorage.getItem('userId');

      if (savedToken && savedUserType && savedUserId) {
        try {
          // Validate token by fetching user profile
          const profileResponse = savedUserType === 'customer' 
            ? await getCustomerProfile()
            : await getBusinessProfile();
          
          setToken(savedToken);
          setUserType(savedUserType);
          setUserId(parseInt(savedUserId));
          setUser(profileResponse.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('userId');
          setToken(null);
          setUserType(null);
          setUserId(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string, type: 'customer' | 'business') => {
    try {
      const response =
        type === 'customer'
          ? await customerLogin({ email, password })
          : await businessLogin({ email, password });

      const data: LoginResponse = response.data;

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userType', data.user_type);
      localStorage.setItem('userId', data.user_id.toString());

      setToken(data.access_token);
      setUserType(data.user_type as 'customer' | 'business');
      setUserId(data.user_id);
      setIsAuthenticated(true);

      // Fetch user profile
      try {
        const profileResponse = type === 'customer' 
          ? await getCustomerProfile()
          : await getBusinessProfile();
        setUser(profileResponse.data);
      } catch (error) {
        toast.error('Failed to fetch user profile');
      }

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setToken(null);
    setUserType(null);
    setUserId(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userId, token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
