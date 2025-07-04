// src/pages/admin/AdminActivity.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Users,
  Briefcase,
  MessageSquare,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import Badge from "../../components/common/Badge";
import api from "../../services/api";

const AdminActivity = ({ darkMode, toggleDarkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const getStartOfTodayUTC = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const today = getStartOfTodayUTC();
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    dateRange: "7d",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-activity", currentPage, filters],
    queryFn: () =>
      api.admin.getAdminActivity({
        page: currentPage,
        limit: 20,
        ...filters,
      }),
    keepPreviousData: true,
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "user_registration":
        return Users;
      case "job_posted":
        return Briefcase;
      case "message_sent":
        return MessageSquare;
      case "payment_processed":
        return IndianRupee;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "user_registration":
        return "blue";
      case "job_posted":
        return "green";
      case "message_sent":
        return "purple";
      case "payment_processed":
        return "orange";
      default:
        return "gray";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Activity <span className="text-orange-500">Monitor</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track platform activity and user interactions in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-6 sm:mt-0">
            <motion.button
              onClick={() => refetch()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                showFilters
                  ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              title: "Total Activities",
              value: data?.activities?.length || 0,
              icon: Activity,
              color: "blue",
              subtitle: "All tracked events",
            },
            {
              title: "Today",
              value:
                data?.activities?.filter(
                  (activity) => activity.createdAt >= today,
                ).length || 0,
              icon: Clock,
              color: "green",
              subtitle: "Activities today",
            },
            {
              title: "This Week",
              value: data?.activities?.length || 0,
              icon: Calendar,
              color: "purple",
              subtitle: "Weekly activities",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h3>
                <span
                  className={`p-2 rounded-full ${
                    stat.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : stat.color === "green"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : stat.color === "orange"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-purple-100 dark:bg-purple-900/30"
                  }`}
                >
                  <stat.icon
                    className={`h-5 w-5 ${
                      stat.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : stat.color === "green"
                          ? "text-green-600 dark:text-green-400"
                          : stat.color === "orange"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                </span>
              </div>
              {isLoading ? (
                <SkeletonLoader type="text" count={1} />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stat.subtitle}
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <option value="">All Types</option>
                  <option value="user_registration">User Registration</option>
                  <option value="job_posted">Job Posted</option>
                  <option value="message_sent">Message Sent</option>
                  <option value="payment_processed">Payment Processed</option>
                </select>

                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({ ...filters, dateRange: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>

                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters({ ...filters, sortBy, sortOrder });
                  }}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activity Log
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time platform activity and user interactions
                </p>
              </div>
            </div>
          </div>

          {/* Activities List */}
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader type="list" count={10} />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.activities?.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);

                return (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-2 rounded-lg ${
                          color === "blue"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : color === "green"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : color === "orange"
                                ? "bg-orange-100 dark:bg-orange-900/30"
                                : color === "purple"
                                  ? "bg-purple-100 dark:bg-purple-900/30"
                                  : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <ActivityIcon
                          className={`w-5 h-5 ${
                            color === "blue"
                              ? "text-blue-600 dark:text-blue-400"
                              : color === "green"
                                ? "text-green-600 dark:text-green-400"
                                : color === "orange"
                                  ? "text-orange-600 dark:text-orange-400"
                                  : color === "purple"
                                    ? "text-purple-600 dark:text-purple-400"
                                    : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.description}
                            </p>
                            <Badge color={color} className="capitalize">
                              {activity.type
                                ? activity.type.replace("_", " ")
                                : ""}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(activity.createdAt)}</span>
                          </div>
                        </div>

                        {activity.user && (
                          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Users className="w-3 h-3" />
                            <span>
                              by {activity.user.name} ({activity.user.email})
                            </span>
                          </div>
                        )}

                        {activity.metadata &&
                          Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                              {Object.entries(activity.metadata).map(
                                ([key, value]) => (
                                  <span key={key} className="mr-3">
                                    {key}: {value}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>
                    {(() => {
                      const limit = 20;
                      const currentPage = data.pagination.currentPage || 1;
                      const currentPageItems = data.activities?.length || 0;

                      if (currentPageItems > 0) {
                        const startItem = (currentPage - 1) * limit + 1;
                        const endItem =
                          (currentPage - 1) * limit + currentPageItems;
                        return `Showing ${startItem} to ${endItem}`;
                      }

                      return `No activities found`;
                    })()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage(data.pagination.currentPage - 1)
                    }
                    disabled={!data.pagination.hasPrevPage}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, data.pagination.totalPages))].map(
                      (_, i) => {
                        const page =
                          Math.max(1, data.pagination.currentPage - 2) + i;
                        if (page > data.pagination.totalPages) return null;

                        return (
                          <motion.button
                            key={page}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                              page === data.pagination.currentPage
                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                                : "text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </motion.button>
                        );
                      },
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage(data.pagination.currentPage + 1)
                    }
                    disabled={!data.pagination.hasNextPage}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminActivity;
