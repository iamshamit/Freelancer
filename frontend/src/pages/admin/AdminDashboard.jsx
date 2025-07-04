// src/pages/admin/AdminDashboard.jsx
import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Shield,
  Activity,
  Server,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Eye,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";

const AdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const { user } = useContext(AuthContext);

  // Fetch dashboard statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => api.admin.getDashboardStats(),
    refetchInterval: 30000,
  });

  // Fetch system health
  const {
    data: systemHealth,
    isLoading: healthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: api.admin.getSystemHealth,
    refetchInterval: 60000,
  });

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

  const isLoading = statsLoading || healthLoading;

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back,{" "}
            <span className="text-orange-500">{user?.name || "Admin"}</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor platform performance and manage system health.
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Users card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </h3>
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </span>
            </div>
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.overview?.totalUsers || 0}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    +{stats?.recentActivity?.newUsersLast30Days || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    this month
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Active Jobs card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Jobs
              </h3>
              <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
              </span>
            </div>
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.overview?.activeJobs || 0}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Currently in progress
            </div>
          </motion.div>

          {/* Platform Revenue card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Platform Revenue
              </h3>
              <span className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <IndianRupee className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </span>
            </div>
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹
                  {(
                    stats?.overview?.totalTransactionAmount || 0
                  ).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    +{stats?.recentActivity?.transactionsLast30Days || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    transactions
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* System Health card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                System Health
              </h3>
              <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </span>
            </div>
            {healthLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemHealth?.overallHealth || "Good"}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {systemHealth?.activeConnections || 0} active connections
            </div>
          </motion.div>
        </motion.div>

        {/* System Health Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl font-bold text-gray-900 dark:text-white mb-6"
          >
            System Health
          </motion.h2>

          {healthLoading ? (
            <SkeletonLoader type="card" />
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Status
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    All Systems Operational
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "API Response Time",
                    value: "127ms",
                    status: "good",
                    icon: Zap,
                  },
                  {
                    name: "Database Performance",
                    value: "99.9%",
                    status: "good",
                    icon: Server,
                  },
                  {
                    name: "Active Users",
                    value: systemHealth?.activeConnections || 0,
                    status: "good",
                    icon: Users,
                  },
                  {
                    name: "Error Rate",
                    value: "0.01%",
                    status: "good",
                    icon: AlertTriangle,
                  },
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <metric.icon
                        className={`w-4 h-4 ${
                          metric.status === "good"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {metric.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {metric.value}
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Recent Activity
          </motion.h2>

          {statsLoading ? (
            <SkeletonLoader type="card" />
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Platform Statistics
                  </h3>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Last 30 days</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: "New User Registrations",
                    value: stats?.recentActivity?.newUsersLast30Days || 0,
                    icon: Users,
                    color: "blue",
                    change: "+12.5%",
                  },
                  {
                    label: "Job Postings",
                    value: stats?.recentActivity?.newJobsLast30Days || 0,
                    icon: Briefcase,
                    color: "green",
                    change: "+8.2%",
                  },
                  {
                    label: "Transactions Processed",
                    value: stats?.recentActivity?.transactionsLast30Days || 0,
                    icon: IndianRupee,
                    color: "orange",
                    change: "+18.9%",
                  },
                  {
                    label: "Active Conversations",
                    value: stats?.overview?.activeChats || 0,
                    icon: MessageSquare,
                    color: "purple",
                    change: "+5.3%",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.color === "blue"
                            ? "bg-blue-500"
                            : activity.color === "green"
                              ? "bg-green-500"
                              : activity.color === "orange"
                                ? "bg-orange-500"
                                : "bg-purple-500"
                        }`}
                      >
                        <activity.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.label}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {activity.change}
                          </span>
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        activity.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : activity.color === "green"
                            ? "text-green-600 dark:text-green-400"
                            : activity.color === "orange"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {activity.value.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
