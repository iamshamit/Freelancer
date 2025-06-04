// src/components/notifications/NotificationDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ChevronRight, X } from 'lucide-react';
import api from '../../services/api';
import SkeletonLoader from '../common/SkeletonLoader';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notification.getAll(),
    staleTime: 60 * 1000, // 1 minute
  });

  console.log('notifications', notifications);

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['notificationsUnreadCount'],
    queryFn: () => api.notification.getUnreadCount().then(res => res.count),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.notification.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notification.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle mark as read
  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <SkeletonLoader type="list" count={3} />
                </div>
              ) : notifications?.length > 0 ? (
                <div className="py-2">
                  {notifications.map((notification) => (
                    <Link
                      key={notification._id}
                      to={notification.link || '#'}
                      onClick={() => !notification.read && markAsReadMutation.mutate(notification._id)}
                      className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.read ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          notification.type === 'application' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          notification.type === 'message' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          notification.type === 'payment' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          notification.type === 'milestone' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <img src={notification.sender.profilePicture} alt={notification.sender.name} className="h-8 w-8 rounded-full object-cover" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.timeAgo}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 text-center">
                  <div className="flex justify-center mb-4">
                    <Bell className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
                <ChevronRight className="inline-block h-4 w-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;