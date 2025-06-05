// src/hooks/useRealTimeNotifications.js
import { useEffect, useContext, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import AuthContext from '../context/AuthContext';

const useRealTimeNotifications = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const initializeSocket = () => {
      const API_URL = 'http://localhost:5000';
      socketRef.current = io(API_URL, {
        auth: {
          token: user.token
        },
        transports: ['websocket', 'polling']
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        // Join user's notification room
        socket.emit('join-notifications', user._id);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from notification server:', reason);
        
        // Attempt to reconnect after 5 seconds
        if (reason === 'io server disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            socket.connect();
          }, 5000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Notification events
      socket.on('new-notification', (notification) => {
        // Update notification queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-center'] });

        // Show toast notification
        showNotificationToast(notification);

        // Show browser notification if enabled
        showBrowserNotification(notification);

        // Play notification sound if enabled
        playNotificationSound();
      });

      socket.on('notification-read', (notificationId) => {
        // Update notification queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      });

      socket.on('notifications-cleared', () => {
        // Update notification queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      });
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, queryClient]);

  // Show toast notification
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

  // Show browser notification
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

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Handle click
      browserNotification.onclick = () => {
        window.focus();
        if (notification.link) {
          window.location.href = notification.link;
        }
        browserNotification.close();
      };
    }
  };

  // Play notification sound
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

  // Emit events to server
  const markNotificationAsRead = (notificationId) => {
    if (socketRef.current) {
      socketRef.current.emit('mark-notification-read', notificationId);
    }
  };

  const markAllNotificationsAsRead = () => {
    if (socketRef.current) {
      socketRef.current.emit('mark-all-notifications-read');
    }
  };

  return {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isConnected: socketRef.current?.connected || false
  };
};

export default useRealTimeNotifications;