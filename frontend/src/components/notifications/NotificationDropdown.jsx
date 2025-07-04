// src/components/notifications/NotificationDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  ChevronRight,
  X,
  Filter,
  Settings,
  Briefcase,
  MessageSquare,
  IndianRupee,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import SkeletonLoader from "../common/SkeletonLoader";
import Badge from "../common/Badge";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Notification categories
  const categories = [
    { id: "all", label: "All", icon: Bell },
    { id: "application", label: "Applications", icon: Briefcase },
    { id: "message", label: "Messages", icon: MessageSquare },
    { id: "payment", label: "Payments", icon: IndianRupee },
    { id: "milestone", label: "Milestones", icon: CheckCircle },
    { id: "rating", label: "Reviews", icon: Star },
  ];

  // Fetch notifications with category filter
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", selectedCategory],
    queryFn: () => api.notification.getAll({ category: selectedCategory }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ["notificationsUnreadCount"],
    queryFn: () => api.notification.getUnreadCount().then((res) => res.count),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // More frequent for unread count
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.notification.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notification.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => api.notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle mark as read
  const handleMarkAsRead = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  // Handle delete notification
  const handleDeleteNotification = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconMap = {
      new_application: Briefcase,
      job_assigned: CheckCircle,
      milestone_completed: CheckCircle,
      milestone_approval_requested: Clock,
      milestone_approved: CheckCircle,
      payment_released: IndianRupee,
      job_completed: CheckCircle,
      new_message: MessageSquare,
      new_rating: Star,
      milestones_created: CheckCircle,
    };

    const IconComponent = iconMap[type] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    const colorMap = {
      new_application: "blue",
      job_assigned: "green",
      milestone_completed: "orange",
      milestone_approval_requested: "yellow",
      milestone_approved: "green",
      payment_released: "purple",
      job_completed: "green",
      new_message: "blue",
      new_rating: "yellow",
      milestones_created: "orange",
    };

    return colorMap[type] || "gray";
  };

  // Filter notifications by category
  const filteredNotifications = Array.isArray(notifications?.notifications)
    ? notifications.notifications.filter((notification) => {
        if (selectedCategory === "all") return true;
        const typeMap = {
          application: ["new_application", "job_assigned"],
          message: ["new_message"],
          payment: ["payment_released"],
          milestone: [
            "milestone_completed",
            "milestone_approval_requested",
            "milestone_approved",
            "milestones_created",
          ],
          rating: ["new_rating"],
        };
        return typeMap[selectedCategory]?.includes(notification.type);
      })
    : [];

  return (
    <div className="relative" ref={dropdownRef}>
      {console.log(notifications)}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[18px] h-[18px]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      showFilters
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    aria-label="Toggle filters"
                  >
                    <Filter className="h-4 w-4" />
                  </button>
                  <Link
                    to="/notifications/settings"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                    aria-label="Notification settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" size="sm">
                    {filteredNotifications.length} notifications
                  </Badge>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" size="sm">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 transition-colors"
                  >
                    {markAllAsReadMutation.isPending
                      ? "Marking..."
                      : "Mark all as read"}
                  </button>
                )}
              </div>

              {/* Category filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              selectedCategory === category.id
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            <IconComponent className="h-3 w-3" />
                            <span>{category.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <SkeletonLoader type="list" count={4} />
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="py-2">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group relative ${
                        !notification.read
                          ? "bg-orange-50 dark:bg-orange-900/10"
                          : ""
                      }`}
                    >
                      <Link
                        to={notification.link || "#"}
                        onClick={() => {
                          if (!notification.read) {
                            markAsReadMutation.mutate(notification._id);
                          }
                          setIsOpen(false);
                        }}
                        className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {/* Notification icon */}
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${`bg-${getNotificationColor(notification.type)}-100 dark:bg-${getNotificationColor(notification.type)}-900/30 text-${getNotificationColor(notification.type)}-600 dark:text-${getNotificationColor(notification.type)}-400`}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Notification content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    !notification.read
                                      ? "text-gray-900 dark:text-white"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {notification.timeAgo}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className={`text-${getNotificationColor(notification.type)}-600 border-${getNotificationColor(notification.type)}-200`}
                                  >
                                    {categories.find(
                                      (cat) =>
                                        cat.id === selectedCategory ||
                                        (selectedCategory === "all" &&
                                          cat.id === "application" &&
                                          [
                                            "new_application",
                                            "job_assigned",
                                          ].includes(notification.type)) ||
                                        (cat.id === "message" &&
                                          notification.type ===
                                            "new_message") ||
                                        (cat.id === "payment" &&
                                          notification.type ===
                                            "payment_released") ||
                                        (cat.id === "milestone" &&
                                          [
                                            "milestone_completed",
                                            "milestone_approval_requested",
                                            "milestone_approved",
                                            "milestones_created",
                                          ].includes(notification.type)) ||
                                        (cat.id === "rating" &&
                                          notification.type === "new_rating"),
                                    )?.label || "General"}
                                  </Badge>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <button
                                    onClick={(e) =>
                                      handleMarkAsRead(notification._id, e)
                                    }
                                    className="p-1 text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                    aria-label="Mark as read"
                                    title="Mark as read"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) =>
                                    handleDeleteNotification(
                                      notification._id,
                                      e,
                                    )
                                  }
                                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                  aria-label="Delete notification"
                                  title="Delete notification"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {selectedCategory === "all"
                      ? "No notifications yet"
                      : `No ${selectedCategory} notifications`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    We'll notify you when something important happens
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <Link
                to="/notifications"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <span>View all notifications</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
