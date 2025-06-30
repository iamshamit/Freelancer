// frontend/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isInitializingRef = useRef(false);
  const isConnectedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up socket connection');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    isInitializingRef.current = false;
    isConnectedRef.current = false;
    setIsConnected(false);
    setOnlineUsers(new Set());
    setConnectionAttempts(0);
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.log('⚠️ Socket initialization already in progress, skipping...');
      return;
    }

    if (!user || !user.token) {
      console.log('❌ Cannot initialize socket: No user or token');
      return;
    }

    // Check if already connected
    if (socketRef.current && socketRef.current.connected && isConnectedRef.current) {
      console.log('✅ Socket already connected, skipping initialization');
      return;
    }

    isInitializingRef.current = true;
    console.log('🔄 Initializing socket connection for user:', user.name, user._id);

    // Clean up existing socket first
    if (socketRef.current) {
      console.log('🧹 Cleaning up existing socket before creating new one');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const SOCKET_URL = API_BASE.replace('/api', '');
    
    console.log('🚀 Creating new socket connection to:', SOCKET_URL);
    
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: user.token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true, // Let socket.io handle reconnection
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Remove forceNew to prevent multiple connections
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully, ID:', socket.id);
      isInitializingRef.current = false;
      isConnectedRef.current = true;
      setIsConnected(true);
      setConnectionAttempts(0);
      
      // Join notification and chat rooms
      socket.emit('join-notifications', user._id);
      socket.emit('join', user._id);
      socket.emit('get-online-users');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      isConnectedRef.current = false;
      setIsConnected(false);
      isInitializingRef.current = false;
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      isConnectedRef.current = false;
      setIsConnected(false);
      isInitializingRef.current = false;
    });

    // Handle force disconnect from server
    socket.on('force-disconnect', (reason) => {
      console.log('🔄 Force disconnect received:', reason);
      isConnectedRef.current = false;
      setIsConnected(false);
      isInitializingRef.current = false;
      
      // Let socket.io handle the reconnection
    });

    // Online/Offline status events
    socket.on('user-online', (userId) => {
      console.log('🟢 User online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user-offline', (userId) => {
      console.log('🔴 User offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on('online-users-list', (users) => {
      console.log('📋 Online users received:', users.length, 'users');
      setOnlineUsers(new Set(users));
    });

    // Notification events with immediate UI updates
    socket.on('new-notification', (notification) => {
      console.log('🔔 New notification received:', notification.title);
      
      // Immediately invalidate queries for instant badge update
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
      
      // Show toast notification
      showNotificationToast(notification);
      
      // Show browser notification
      showBrowserNotification(notification);
      
      // Play sound
      playNotificationSound();
    });

    socket.on('notification-read', (notificationId) => {
      console.log('✅ Notification read:', notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
    });

    socket.on('notifications-cleared', () => {
      console.log('🗑️ All notifications cleared');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      queryClient.invalidateQueries({ queryKey: ['notification-counts'] });
    });

    // Chat events
    socket.on('newMessage', (data) => {
      console.log('💬 New message received');
      queryClient.invalidateQueries(['chat', data.chatId]);
      
      if (data.sender !== user._id) {
        toast.success(`New message received!`, {
          icon: '💬',
          duration: 3000
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      toast.error(`Connection error: ${error.message || 'Unknown error'}`);
    });

  }, [user, queryClient]); // Simplified dependencies

  // Effect to handle user changes - FIXED DEPENDENCIES
  useEffect(() => {
    if (!user || !user.token) {
      console.log('❌ No user or token, cleaning up socket');
      cleanup();
      return;
    }

    console.log('👤 User changed, initializing socket for:', user.name);
    initializeSocket();

    // Cleanup on unmount or user change
    return () => {
      console.log('🧹 Component unmounting or user changed, cleaning up...');
      cleanup();
    };
  }, [user?._id, user?.token]); // Only depend on user ID and token

  // Notification helper functions
  const showNotificationToast = useCallback((notification) => {
    const getNotificationIcon = (type) => {
      const iconMap = {
        'new_application': '💼',
        'job_assigned': '✅',
        'milestone_completed': '🎯',
        'milestone_approval_requested': '⏰',
        'milestone_approved': '✅',
        'payment_released': '💰',
        'job_completed': '🎉',
        'new_message': '💬',
        'new_rating': '⭐',
        'milestones_created': '📋',
        'account_suspended': '⚠️',
        'account_reactivated': '✅',
        'default': '🔔'
      };
      return iconMap[type] || iconMap.default;
    };

    toast((t) => (
      <div className="flex items-start space-x-3 max-w-sm">
        <div className="flex-shrink-0">
          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {notification.title}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    ), {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  const showBrowserNotification = useCallback((notification) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification._id,
          requireInteraction: false,
          silent: false
        });

        setTimeout(() => {
          browserNotification.close();
        }, 5000);

        browserNotification.onclick = () => {
          window.focus();
          if (notification.link) {
            window.location.href = notification.link;
          }
          browserNotification.close();
        };
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showBrowserNotification(notification);
          }
        });
      }
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }, []);

  // Socket event emitters
  const markNotificationAsRead = useCallback((notificationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-notification-read', notificationId);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-all-notifications-read');
    }
  }, []);

  const sendMessage = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', data);
    }
  }, []);

  const joinChat = useCallback((chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-chat', chatId);
    }
  }, []);

  const leaveChat = useCallback((chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-chat', chatId);
    }
  }, []);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    isUserOnline,
    cleanup,
    connectionAttempts,
    maxReconnectAttempts,
    // Notification functions
    markNotificationAsRead,
    markAllNotificationsAsRead,
    // Chat functions
    sendMessage,
    joinChat,
    leaveChat
  };

  return (
    <SocketContext.Provider value={value}>
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

export default SocketContext;