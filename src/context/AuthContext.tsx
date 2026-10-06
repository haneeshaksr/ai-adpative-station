import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, getOfflineQueue, clearOfflineQueue } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOffline: boolean;
  toggleOfflineMode: () => void;
  syncOfflineData: () => Promise<number>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  currentStationStatus: 'ONLINE' | 'STANDBY' | 'OFFLINE';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smart_station_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(() => localStorage.getItem('smart_station_offline') === 'true');
  const [currentStationStatus, setCurrentStationStatus] = useState<'ONLINE' | 'STANDBY' | 'OFFLINE'>('ONLINE');

  const toggleOfflineMode = () => {
    const next = !isOffline;
    setIsOffline(next);
    localStorage.setItem('smart_station_offline', String(next));
  };

  const syncOfflineData = async (): Promise<number> => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return 0;
    try {
      const res = await api.syncOfflineQueue(queue);
      clearOfflineQueue();
      return res.syncedCount || queue.length;
    } catch (err) {
      console.error('Offline sync failed:', err);
      return 0;
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('smart_station_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn('Failed to verify token, clearing session:', err);
      localStorage.removeItem('smart_station_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Check station hardware status & connect WebSocket if possible
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      ws.onopen = () => {
        setCurrentStationStatus('ONLINE');
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'HARDWARE_PULSE') {
            setCurrentStationStatus('ONLINE');
          }
        } catch (e) {
          // ignore
        }
      };
      ws.onerror = () => {
        // Fall back gracefully
      };
      ws.onclose = () => {
        // Fall back
      };
    } catch (e) {
      // ignore
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('smart_station_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('smart_station_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    const credentials: Record<UserRole, { email: string; pass: string }> = {
      student: { email: 'student@example.com', pass: 'password123' },
      teacher: { email: 'teacher@example.com', pass: 'password123' },
      parent: { email: 'parent@example.com', pass: 'password123' },
      admin: { email: 'admin@example.com', pass: 'password123' },
    };
    const cred = credentials[role];
    await login(cred.email, cred.pass);
  };

  const logout = () => {
    localStorage.removeItem('smart_station_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: any) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isOffline,
        toggleOfflineMode,
        syncOfflineData,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        refreshUser,
        currentStationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
