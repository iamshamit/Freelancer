import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Crown,
  Briefcase,
  Users,
  CheckCircle,
  AlertTriangle,
  Shield,
  ShieldOff,
  IndianRupee,
  Star,
  Clock,
  Activity,
  UserCheck,
  UserX,
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Search,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Globe,
  MapPin,
  FileText,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import Badge from "../../components/common/Badge";
import api from "../../services/api";

const UserDetailPage = ({ darkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const userId = id;

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => api.admin.getUserDetails(userId),
    enabled: !!userId,
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ isActive, reason }) =>
      api.admin.updateUserStatus(userId, { isActive, reason }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["admin-user-detail", userId]);
      setActionLoading(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update user status",
      );
      setActionLoading(false);
    },
  });

  const handleStatusChange = (isActive) => {
    const reason = prompt(
      `Please provide a reason for ${isActive ? "activating" : "suspending"} this user:`,
    );

    if (reason !== null && reason.trim()) {
      setActionLoading(true);
      updateUserStatusMutation.mutate({ isActive, reason: reason.trim() });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return Crown;
      case "employer":
        return Briefcase;
      case "freelancer":
        return Users;
      default:
        return Users;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "red";
      case "employer":
        return "blue";
      case "freelancer":
        return "green";
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

  if (isLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <SkeletonLoader type="page" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !userData) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              User Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <motion.button
              onClick={() => navigate("/admin/users")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Users</span>
            </motion.button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const user = userData.user;
  const statistics = userData.statistics;
  const isActive = user.accountStatus?.isActive !== false;
  const RoleIcon = getRoleIcon(user.role);

  const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "security", label: "Security", icon: Lock },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* User Profile Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="lg:col-span-1"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-2xl rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg">
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </div>
              )}
              {user.accountStatus?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {user.name}
            </h3>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <RoleIcon
                className={`w-4 h-4 ${
                  user.role === "admin"
                    ? "text-red-500"
                    : user.role === "employer"
                      ? "text-blue-500"
                      : "text-green-500"
                }`}
              />
              <Badge
                color={getRoleBadgeColor(user.role)}
                className="capitalize"
              >
                {user.role}
              </Badge>
            </div>

            <div className="flex items-center justify-center space-x-2 mb-4">
              {isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <Badge color={isActive ? "green" : "red"}>
                {isActive ? "Active" : "Suspended"}
              </Badge>
            </div>

            <div className="flex justify-center space-x-2">
              {user.accountStatus?.isVerified && (
                <Badge color="blue" size="sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {user.securitySettings?.twoFactorEnabled && (
                <Badge color="purple" size="sm">
                  <Shield className="w-3 h-3 mr-1" />
                  2FA
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span className="text-sm break-all">{user.email}</span>
            </div>

            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>

            {user.averageRating > 0 && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">
                  {user.averageRating.toFixed(1)} ★ ({user.ratings?.length || 0}{" "}
                  reviews)
                </span>
              </div>
            )}
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                About
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.bio}
              </p>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <Badge key={index} color="gray" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Stats and Details */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="lg:col-span-2 space-y-8"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              title: "Total Jobs",
              value: statistics?.totalJobs || 0,
              icon: Briefcase,
              color: "blue",
              subtitle: "All jobs",
            },
            {
              title: "Completed Jobs",
              value: statistics?.completedJobs || 0,
              icon: CheckCircle,
              color: "green",
              subtitle: "Successfully completed",
            },
            {
              title:
                user.role === "freelancer" ? "Total Earnings" : "Total Spent",
              value: `₹${((user.role === "freelancer" ? statistics?.totalEarnings : statistics?.totalSpent) || 0).toLocaleString()}`,
              icon: IndianRupee,
              color: "orange",
              subtitle:
                user.role === "freelancer"
                  ? "Lifetime earnings"
                  : "Platform spending",
            },
            {
              title: "Total Chats",
              value: statistics?.totalChats || 0,
              icon: MessageSquare,
              color: "purple",
              subtitle: "Chat conversations",
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
                          : stat.color === "purple"
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "bg-gray-100 dark:bg-gray-700"
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
                            : stat.color === "purple"
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.subtitle}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Ratings */}
        {user.ratings && user.ratings.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Ratings
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest reviews and ratings received
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {user.ratings.slice(0, 5).map((rating, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rating.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {rating.rating}/5
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          "{rating.review}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(rating.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Notification Preferences */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Preferences
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Email
                </span>
              </div>
              <Badge
                color={
                  user.notificationPreferences?.email?.enabled
                    ? "green"
                    : "gray"
                }
              >
                {user.notificationPreferences?.email?.enabled
                  ? "Enabled"
                  : "Disabled"}
              </Badge>
            </div>
            {user.notificationPreferences?.email?.enabled && (
              <div className="ml-6 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Frequency:{" "}
                  <span className="capitalize">
                    {user.notificationPreferences.email.frequency}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    user.notificationPreferences.email.types || {},
                  ).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Push
                </span>
              </div>
              <Badge
                color={
                  user.notificationPreferences?.push?.enabled ? "green" : "gray"
                }
              >
                {user.notificationPreferences?.push?.enabled
                  ? "Enabled"
                  : "Disabled"}
              </Badge>
            </div>
            {user.notificationPreferences?.push?.enabled && (
              <div className="ml-6">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    user.notificationPreferences.push.types || {},
                  ).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* In-App Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  In-App
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  color={
                    user.notificationPreferences?.inApp?.enabled
                      ? "green"
                      : "gray"
                  }
                >
                  {user.notificationPreferences?.inApp?.enabled
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
                {user.notificationPreferences?.inApp?.sound && (
                  <Volume2 className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
            {user.notificationPreferences?.inApp?.enabled && (
              <div className="ml-6">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(
                    user.notificationPreferences.inApp.types || {},
                  ).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quiet Hours */}
          {user.notificationPreferences?.quietHours && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Quiet Hours
                  </span>
                </div>
                <Badge
                  color={
                    user.notificationPreferences.quietHours.enabled
                      ? "blue"
                      : "gray"
                  }
                >
                  {user.notificationPreferences.quietHours.enabled
                    ? "Active"
                    : "Inactive"}
                </Badge>
              </div>
              {user.notificationPreferences.quietHours.enabled && (
                <div className="ml-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.notificationPreferences.quietHours.start} -{" "}
                    {user.notificationPreferences.quietHours.end}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Privacy Settings
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Activity Settings */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Activity
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show online status
                </span>
                <div className="flex items-center space-x-2">
                  {user.privacySettings?.activity?.showOnlineStatus ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <Badge
                    color={
                      user.privacySettings?.activity?.showOnlineStatus
                        ? "green"
                        : "gray"
                    }
                  >
                    {user.privacySettings?.activity?.showOnlineStatus
                      ? "Visible"
                      : "Hidden"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show last seen
                </span>
                <div className="flex items-center space-x-2">
                  {user.privacySettings?.activity?.showLastSeen ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <Badge
                    color={
                      user.privacySettings?.activity?.showLastSeen
                        ? "green"
                        : "gray"
                    }
                  >
                    {user.privacySettings?.activity?.showLastSeen
                      ? "Visible"
                      : "Hidden"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Messaging Settings */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Messaging
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show read receipts
                </span>
                <Badge
                  color={
                    user.privacySettings?.messaging?.showReadReceipts
                      ? "green"
                      : "gray"
                  }
                >
                  {user.privacySettings?.messaging?.showReadReceipts
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show typing indicator
                </span>
                <Badge
                  color={
                    user.privacySettings?.messaging?.showTypingIndicator
                      ? "green"
                      : "gray"
                  }
                >
                  {user.privacySettings?.messaging?.showTypingIndicator
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Search Settings */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Search & Discovery
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Appear in search
                </span>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Badge
                    color={
                      user.privacySettings?.search?.appearInSearch
                        ? "green"
                        : "gray"
                    }
                  >
                    {user.privacySettings?.search?.appearInSearch
                      ? "Visible"
                      : "Hidden"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show in directory
                </span>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <Badge
                    color={
                      user.privacySettings?.search?.showInDirectory
                        ? "green"
                        : "gray"
                    }
                  >
                    {user.privacySettings?.search?.showInDirectory
                      ? "Visible"
                      : "Hidden"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Security Settings */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Security Settings
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${user.securitySettings?.twoFactorEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                <Shield
                  className={`w-4 h-4 ${user.securitySettings?.twoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.securitySettings?.twoFactorEnabled
                    ? "Enhanced security enabled"
                    : "Additional security layer"}
                </p>
              </div>
            </div>
            <Badge
              color={user.securitySettings?.twoFactorEnabled ? "green" : "gray"}
            >
              {user.securitySettings?.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          {/* Backup Codes */}
          {user.securitySettings?.twoFactorEnabled && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Backup Codes
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.securitySettings?.backupCodes?.length || 0} codes
                    generated
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${user.securitySettings?.loginNotifications ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                <Bell
                  className={`w-4 h-4 ${user.securitySettings?.loginNotifications ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Login Notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified of new login attempts
                </p>
              </div>
            </div>
            <Badge
              color={
                user.securitySettings?.loginNotifications ? "blue" : "gray"
              }
            >
              {user.securitySettings?.loginNotifications
                ? "Enabled"
                : "Disabled"}
            </Badge>
          </div>

          {/* Unusual Activity Alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${user.securitySettings?.unusualActivityAlerts ? "bg-orange-100 dark:bg-orange-900/30" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                <AlertTriangle
                  className={`w-4 h-4 ${user.securitySettings?.unusualActivityAlerts ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Unusual Activity Alerts
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Alert on suspicious account activity
                </p>
              </div>
            </div>
            <Badge
              color={
                user.securitySettings?.unusualActivityAlerts ? "orange" : "gray"
              }
            >
              {user.securitySettings?.unusualActivityAlerts
                ? "Enabled"
                : "Disabled"}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Account Status */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Status
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900 dark:text-white">
                Current Status
              </span>
              <div className="flex items-center space-x-2">
                {user.accountStatus?.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <Badge color={user.accountStatus?.isActive ? "green" : "red"}>
                  {user.accountStatus?.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Verified:
                </span>
                <span
                  className={`ml-2 ${user.accountStatus?.isVerified ? "text-green-600" : "text-red-600"}`}
                >
                  {user.accountStatus?.isVerified ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Suspended:
                </span>
                <span
                  className={`ml-2 ${user.accountStatus?.isSuspended ? "text-red-600" : "text-green-600"}`}
                >
                  {user.accountStatus?.isSuspended ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Account Timestamps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Account Created
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-8">
      {/* Search History */}
      {user.searchHistory && user.searchHistory.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search History
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Recent search queries by this user
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {user.searchHistory.slice(0, 10).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {search.query || search}
                    </span>
                  </div>
                  {search.timestamp && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(search.timestamp)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Saved Searches */}
      {user.savedSearches && user.savedSearches.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Saved Searches
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Bookmarked search queries
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {user.savedSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {search.name || search.query}
                      </span>
                      {search.filters && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Object.keys(search.filters).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {search.createdAt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(search.createdAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {(!user.searchHistory || user.searchHistory.length === 0) &&
        (!user.savedSearches || user.savedSearches.length === 0) && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Activity Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This user hasn't performed any tracked activities yet.
              </p>
            </div>
          </motion.div>
        )}
    </div>
  );

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate("/admin/users")}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User <span className="text-orange-500">Details</span>
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage user account information
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-6 sm:mt-0">
            {isActive ? (
              <motion.button
                onClick={() => handleStatusChange(false)}
                disabled={actionLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <ShieldOff className="w-4 h-4" />
                <span className="font-medium">Suspend User</span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => handleStatusChange(true)}
                disabled={actionLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Activate User</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-orange-500 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "settings" && renderSettingsTab()}
          {activeTab === "security" && renderSecurityTab()}
          {activeTab === "activity" && renderActivityTab()}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailPage;
