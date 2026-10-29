import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, RoommateProfile } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateRoommateProfile: (data: Partial<RoommateProfile>) => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isFavorited: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('roomly_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('roomly_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('roomly_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data;
    localStorage.setItem('roomly_token', authToken);
    setToken(authToken);
    setUser(loggedInUser);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { user: registeredUser, token: authToken } = res.data;
    localStorage.setItem('roomly_token', authToken);
    setToken(authToken);
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('roomly_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.put('/auth/profile', data);
    setUser(prev => prev ? { ...prev, ...res.data.user } : null);
  };

  const updateRoommateProfile = async (data: Partial<RoommateProfile>) => {
    const res = await api.put('/auth/roommate-profile', data);
    setUser(prev => prev ? { ...prev, roommateProfile: res.data.roommateProfile } : null);
  };

  const toggleFavorite = async (propertyId: string): Promise<boolean> => {
    if (!user) return false;
    const res = await api.post(`/properties/${propertyId}/favorite`);
    const { isFavorited: favorited } = res.data;

    setUser(prev => {
      if (!prev) return null;
      const curFavs = prev.favoritePropertyIds || [];
      const updatedFavs = favorited
        ? [...curFavs, propertyId]
        : curFavs.filter(id => id !== propertyId);
      return {
        ...prev,
        favoritePropertyIds: updatedFavs
      };
    });

    return !!favorited;
  };

  const isFavorited = (propertyId: string): boolean => {
    return !!user?.favoritePropertyIds?.includes(propertyId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateRoommateProfile,
        toggleFavorite,
        isFavorited
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
