// src/components/notifications/NotificationCenter.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { 
  Bell, Check, X, Filter, Search, Settings, Archive, 
  Trash2, CheckCircle, Clock, AlertCircle, Info,
  Briefcase, MessageSquare, DollarSign, Star,
  ChevronDown, MoreHorizontal, Eye, EyeOff
} from 'lucide-react';
import api from '../../services/api';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';

const NotificationCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const queryClient = useQueryClient();

  // Categories and filters
  const categories = [
    { id: 'all', label: 'All Notifications', icon: Bell, count: 0 },
    { id: 'application', label: 'Applications', icon: Briefcase, count: 0 },
    { id: 'message', label: 'Messages', icon: MessageSquare, count: 0 },
    { id: 'payment', label: 'Payments', icon: DollarSign, count: 0 },
    { id: 'milestone', label: 'Milestones', icon: CheckCircle, count: 0 },
    { id: 'rating', label: 'Reviews', icon: Star, count: 0 }
  ];

  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'read', label: 'Read' },
    { id: 'archived', label: 'Archived' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'unread', label: 'Unread First' },
    { id: 'type', label: 'By Type' }
  ];

  // Fetch notifications with infinite scroll
  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['notifications-center', selectedCategory, selectedStatus, searchQuery, sortBy],
    queryFn: ({ pageParam = 1 }) => 
      api.notification.getAll({
        page: pageParam,
        limit: 20,
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery,
        sortBy
      }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });

  // Fetch notification counts for categories
  const { data: categoryCounts } = useQuery({
    queryKey: ['notification-counts'],
    queryFn: () => api.notification.getCategoryCounts(),
    staleTime: 60 * 1000,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (ids) => api.notification.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      setSelectedNotifications([]);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notification.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
    },
  });

  const deleteNotificationsMutation = useMutation({
    mutationFn: (ids) => api.notification.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnreadCount'] });
      setSelectedNotifications([]);
    },
  });

  const archiveNotificationsMutation = useMutation({
    mutationFn: (ids) => api.notification.archiveMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-center'] });
      setSelectedNotifications([]);
    },
  });

  // Flatten notifications from infinite query
  const notifications = notificationsData?.pages?.flatMap(page => page.notifications) || [];

  // Update category counts
  useEffect(() => {
    if (categoryCounts) {
      categories.forEach(category => {
        category.count = categoryCounts[category.id] || 0;
      });
    }
  }, [categoryCounts]);

  // Handle notification selection
  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const unreadNotifications = notifications.filter(n => !n.read).map(n => n._id);
    setSelectedNotifications(
      selectedNotifications.length === unreadNotifications.length ? [] : unreadNotifications
    );
  };

  // Get notification icon and color
  const getNotificationMeta = (type) => {
    const metaMap = {
      'new_application': { icon: Briefcase, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'job_assigned': { icon: CheckCircle, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'milestone_completed': { icon: CheckCircle, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'milestone_approval_requested': { icon: Clock, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'milestone_approved': { icon: CheckCircle, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'payment_released': { icon: DollarSign, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'job_completed': { icon: CheckCircle, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'new_message': { icon: MessageSquare, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'new_rating': { icon: Star, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'milestones_created': { icon: CheckCircle, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' }
    };
    
    return metaMap[type] || { icon: Bell, color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your notifications in one place
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              showFilters 
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400' 
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Bell className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{category.label}</span>
                    </div>
                    {category.count > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {category.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="w-full flex items-center justify-start px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
                
                <button
                  onClick={() => setSelectedStatus('archived')}
                  className="w-full flex items-center justify-start px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  View Archived
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters and Search */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
              >
                {statusFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markAsReadMutation.mutate(selectedNotifications)}
                      disabled={markAsReadMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Read
                    </button>
                    
                    <button
                      onClick={() => archiveNotificationsMutation.mutate(selectedNotifications)}
                      disabled={archiveNotificationsMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </button>
                    
                    <button
                      onClick={() => deleteNotificationsMutation.mutate(selectedNotifications)}
                      disabled={deleteNotificationsMutation.isPending}
                      className="inline-flex items-center px-3 py-1.5 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <SkeletonLoader type="notification-center" count={5} />
              </div>
            ) : notifications.length > 0 ? (
              <>
                {/* Select All */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.filter(n => !n.read).length && notifications.filter(n => !n.read).length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Select all unread notifications
                    </span>
                  </label>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {notifications.length} total notifications
                  </span>
                </div>

                {/* Notification Items */}
                {notifications.map((notification) => {
                  const meta = getNotificationMeta(notification.type);
                  const IconComponent = meta.icon;
                  
                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group ${
                        !notification.read ? 'ring-2 ring-orange-100 dark:ring-orange-900/30' : ''
                      }`}
                    >
                      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md ${
                        !notification.read 
                          ? 'bg-orange-50/50 dark:bg-orange-900/10' 
                          : ''
                      }`}>
                        <div className="flex items-start space-x-4">
                          {/* Selection checkbox */}
                          <div className="flex items-center pt-1">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification._id)}
                              onChange={() => handleSelectNotification(notification._id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                          </div>

                          {/* Notification icon */}
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${meta.bgColor}`}>
                            <IconComponent className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>

                          {/* Notification content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </h4>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>

                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {notification.timeAgo}
                                  </span>
                                  
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">
                                    {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>

                                  {notification.sender && (
                                    <div className="flex items-center space-x-1">
                                      <img
                                        src={notification.sender.profilePicture || '/default-avatar.png'}
                                        alt={notification.sender.name}
                                        className="h-4 w-4 rounded-full"
                                      />
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {notification.sender.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsReadMutation.mutate([notification._id])}
                                    className="p-1.5 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                    title="Mark as read"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => archiveNotificationsMutation.mutate([notification._id])}
                                  className="p-1.5 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  title="Archive"
                                >
                                  <Archive className="h-4 w-4" />
                                </button>
                                
                                <button
                                  onClick={() => deleteNotificationsMutation.mutate([notification._id])}
                                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Notification actions (if any) */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="mt-3 flex items-center space-x-2">
                                {notification.actions.map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      // Handle action click
                                      if (action.link) {
                                        window.location.href = action.link;
                                      }
                                    }}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                                      action.primary
                                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                        : 'border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Load More */}
                {hasNextPage && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Load More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Bell}
                title="No notifications found"
                description={
                  searchQuery 
                    ? `No notifications match "${searchQuery}"`
                    : selectedCategory === 'all' 
                      ? "You're all caught up! No notifications to show."
                      : `No ${selectedCategory} notifications found.`
                }
                action={
                  searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      Clear search
                    </button>
                  ) : null
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;