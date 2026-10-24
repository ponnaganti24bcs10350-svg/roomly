import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/client';
import { NotificationItem } from '../types';

export interface ActiveUser {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  city?: string;
  occupation?: string;
  connectedAt?: string;
}

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: string;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: NotificationItem[];
  unreadCount: number;
  onlineUsers: ActiveUser[];
  isUserOnline: (userId: string) => boolean;
  toast: ToastAlert | null;
  dismissToast: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([]);
  const [toast, setToast] = useState<ToastAlert | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.warn('Failed to fetch notifications');
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const res = await api.get('/auth/active-users');
      if (res.data.activeUsers) {
        setOnlineUsers(res.data.activeUsers);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
      setOnlineUsers([]);
      return;
    }

    const s = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('⚡ Connected to Roomly WebSocket server');
      s.emit('register_user', user.id);
      fetchActiveUsers();
    });

    s.on('online_users_updated', (list: ActiveUser[]) => {
      console.log('👥 Online users updated:', list.length);
      setOnlineUsers(list);
    });

    s.on('notification_received', (data: any) => {
      setToast({
        id: Date.now().toString(),
        title: data.title,
        message: data.message,
        type: data.type || 'INFO'
      });
      setUnreadCount(prev => prev + 1);
      fetchNotifications();
    });

    s.on('visit_status_changed', (data: any) => {
      setToast({
        id: Date.now().toString(),
        title: `Visit Update: ${data.status} 📅`,
        message: `Your visit for "${data.title}" was updated to ${data.status}.`,
        type: 'VISIT'
      });
      fetchNotifications();
    });

    setSocket(s);
    fetchNotifications();
    fetchActiveUsers();

    return () => {
      s.disconnect();
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  const dismissToast = () => setToast(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        onlineUsers,
        isUserOnline,
        toast,
        dismissToast,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
