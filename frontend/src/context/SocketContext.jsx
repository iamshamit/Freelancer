// frontend/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const initializingRef = useRef(false);
  const lastInitAttemptRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  useEffect(() => {
    if (!user || !user.token) {
      console.log('❌ No user or token:', { hasUser: !!user, hasToken: !!user?.token });
      if (socketRef.current) {
        console.log('🔄 Disconnecting socket - no user or token');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers(new Set());
        initializingRef.current = false;
      }
      return;
    }

    console.log('✅ User and token available, checking socket connection');
    
    // Only create socket if it doesn't exist and we're not already initializing
    if (!socketRef.current && !initializingRef.current) {
      initializeSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Don't disconnect on unmount - keep connection alive
    };
  }, [user?._id, user?.token]);

  const initializeSocket = () => {
    if (initializingRef.current) {
      console.log('⚠️ Socket initialization already in progress, skipping...');
      return;
    }
    
    // Rate limiting: prevent rapid reconnection attempts
    const now = Date.now();
    const timeSinceLastAttempt = now - lastInitAttemptRef.current;
    const minDelay = 3000; // Minimum 3 seconds between connection attempts
    
    if (timeSinceLastAttempt < minDelay) {
      console.log(`⏰ Rate limiting: waiting ${minDelay - timeSinceLastAttempt}ms before next connection attempt`);
      setTimeout(() => {
        if (!socketRef.current || !socketRef.current.connected) {
          initializeSocket();
        }
      }, minDelay - timeSinceLastAttempt);
      return;
    }
    
    initializingRef.current = true;
    lastInitAttemptRef.current = now;
    
    // Fix: Remove /api from socket URL - Socket.io runs on root path
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const SOCKET_URL = API_BASE.replace('/api', ''); // Remove /api for socket connection
    
    console.log('🔄 Initializing socket connection...', { 
      SOCKET_URL, 
      userId: user._id, 
      hasToken: !!user.token 
    });
    
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: user.token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      randomizationFactor: 0.5
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server, socket ID:', socket.id);
      console.log('🔄 Setting isConnected to true');
      setIsConnected(true);
      initializingRef.current = false; // Reset initialization flag
      
      // Join both notification and chat rooms
      socket.emit('join-notifications', user._id);
      socket.emit('join', user._id);
      
      // Request online users list
      socket.emit('get-online-users');
      
      console.log('🔍 Socket connected status:', socket.connected);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      console.log('🔄 Setting isConnected to false');
      setIsConnected(false);
      initializingRef.current = false; // Reset initialization flag
      
      // Don't manually reconnect - let socket.io handle it automatically
      // Manual reconnection can cause loops
      
      // If server forced disconnect, clean up socket reference
      if (reason === 'io server disconnect' || reason === 'server namespace disconnect') {
        console.log('🧹 Server forced disconnect, cleaning up socket reference');
        socketRef.current = null;
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
      initializingRef.current = false; // Reset initialization flag
    });

    // Handle force disconnect from server
    socket.on('force-disconnect', (reason) => {
      console.log('🔄 Server requesting force disconnect:', reason);
      // Don't attempt to reconnect immediately - let the new connection establish
      setIsConnected(false);
      initializingRef.current = false;
      socketRef.current = null;
    });

    // Online/Offline status events
    socket.on('user-online', (userId) => {
      console.log('🟢 User came online:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user-offline', (userId) => {
      console.log('🔴 User went offline:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on('online-users-list', (users) => {
      console.log('📋 Received online users list:', users);
      setOnlineUsers(new Set(users));
    });

    // Notification events
    socket.on('new-notification', (notification) => {
      console.log('🔔 Received new notification:', notification);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      showNotificationToast(notification);
      showBrowserNotification(notification);
      playNotificationSound();
    });

    socket.on('notification-read', (notificationId) => {
      console.log('✅ Notification marked as read:', notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
    });

    socket.on('notifications-cleared', () => {
      console.log('🗑️ All notifications cleared');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
    });

    // Chat events
    socket.on('newMessage', (data) => {
      console.log('💬 Received new message:', data);
      queryClient.invalidateQueries(['chat', data.chatId]);
      
      if (data.sender !== user._id) {
        toast.success('New message received!');
      }
    });
  };

  // Add periodic connection check to ensure state stays in sync
  useEffect(() => {
    if (!socketRef.current) return;

    const checkConnection = () => {
      const actualConnectionStatus = socketRef.current?.connected || false;
      
      if (actualConnectionStatus !== isConnected) {
        console.log('🔄 Connection status mismatch - updating:', {
          actual: actualConnectionStatus,
          state: isConnected
        });
        setIsConnected(actualConnectionStatus);
      }
    };

    // Check connection status less frequently to avoid aggressive checking
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Notification helper functions
  const showNotificationToast = (notification) => {
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
        'milestones_created': '📋'
      };
      return iconMap[type] || '🔔';
    };

    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Close
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right'
    });
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
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
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  };

  // Socket event emitters
  const markNotificationAsRead = (notificationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-notification-read', notificationId);
    }
  };

  const markAllNotificationsAsRead = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-all-notifications-read');
    }
  };

  const sendMessage = (data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('sendMessage', data);
    }
  };

  const joinChat = (chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-chat', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-chat', chatId);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Cleanup function
  const cleanup = () => {
    if (socketRef.current) {
      console.log('🧹 Cleaning up socket connection');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    initializingRef.current = false;
    lastInitAttemptRef.current = 0;
    setIsConnected(false);
    setOnlineUsers(new Set());
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    isUserOnline,
    cleanup,
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