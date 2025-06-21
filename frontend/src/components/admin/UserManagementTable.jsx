import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Users, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldOff,
  ArrowLeft,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  Crown,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorFallback from '../../components/common/ErrorFallback';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Tooltip from '../../components/common/Tooltip';

// Enhanced Avatar component
const Avatar = ({ src, alt, size = 'sm', fallback }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const getFallbackInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || imageError) {
    return (
      <div className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium
        rounded-full flex items-center justify-center shadow-sm
      `}>
        {getFallbackInitials(fallback || alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      className={`
        ${sizeClasses[size]}
        rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm
      `}
    />
  );
};

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-users', currentPage, filters],
    queryFn: () => api.admin.getUsers({
      page: currentPage,
      limit: 10,
      ...filters
    }),
    keepPreviousData: true
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive, reason }) => api.admin.updateUserStatus(userId, { isActive, reason }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['admin-users']);
      setActionUserId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  });

  const handleStatusChange = (userId, isActive) => {
    const reason = prompt(
      `Please provide a reason for ${isActive ? 'activating' : 'suspending'} this user:`
    );
    
    if (reason !== null && reason.trim()) {
      setActionUserId(userId);
      updateUserStatusMutation.mutate({ userId, isActive, reason: reason.trim() });
    }
  };

  const handleSelectUser = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === data?.users?.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(data?.users?.map(user => user._id) || []));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'employer': return 'blue';
      case 'freelancer': return 'green';
      default: return 'gray';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Crown;
      case 'employer': return Briefcase;
      case 'freelancer': return Users;
      default: return Users;
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user management...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <ErrorFallback 
          error={error} 
          resetError={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-400/5 to-pink-500/5 rounded-full filter blur-3xl" />
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <motion.button
              onClick={handleGoBack}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </motion.button>

            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage users, view details, and update account status
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            {/* Refresh Button */}
            <motion.button
              onClick={() => refetch()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            {/* Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Users',
              value: data?.pagination?.totalUsers || 0,
              icon: Users,
              color: 'blue',
              subtitle: 'All registered users'
            },
            {
              title: 'Active Users',
              value: data?.stats?.activeUsers || 0,
              icon: UserCheck,
              color: 'green',
              subtitle: 'Currently active'
            },
            {
              title: 'Suspended',
              value: data?.stats?.suspendedUsers || 0,
              icon: UserX,
              color: 'red',
              subtitle: 'Account suspended'
            },
            {
              title: 'New This Month',
              value: data?.stats?.newUsersThisMonth || 0,
              icon: Calendar,
              color: 'purple',
              subtitle: 'Recent registrations'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
                  stat.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                  stat.color === 'green' ? 'from-green-500 to-emerald-500' :
                  stat.color === 'red' ? 'from-red-500 to-pink-500' :
                  'from-purple-500 to-pink-500'
                }`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      stat.color === 'red' ? 'bg-red-50 dark:bg-red-900/20' :
                      'bg-purple-50 dark:bg-purple-900/20'
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">All Roles</option>
                  <option value="freelancer">Freelancers</option>
                  <option value="employer">Employers</option>
                  <option value="admin">Admins</option>
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder });
                  }}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced User Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Directory
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage user accounts and permissions
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedUsers.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{selectedUsers.size} selected</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === data?.users?.length && data?.users?.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.users?.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const isActive = user.accountStatus?.isActive !== false;
                  
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.profilePicture}
                            alt={user.name}
                            size="md"
                            fallback={user.name}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <RoleIcon className={`w-4 h-4 ${
                            user.role === 'admin' ? 'text-red-500' :
                            user.role === 'employer' ? 'text-blue-500' :
                            'text-green-500'
                          }`} />
                          <Badge color={getRoleBadgeColor(user.role)} className="capitalize">
                            {user.role}
                          </Badge>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          <Badge color={getStatusBadgeColor(isActive)}>
                            {isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tooltip content="View Profile">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                window.location.href = `/admin/users/${user._id}`;
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          </Tooltip>
                          
                          {isActive ? (
                            <Tooltip content="Suspend User">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusChange(user._id, false)}
                                disabled={updateUserStatusMutation.isPending && actionUserId === user._id}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                              >
                                <ShieldOff className="w-4 h-4" />
                              </motion.button>
                            </Tooltip>
                          ) : (
                            <Tooltip content="Activate User">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusChange(user._id, true)}
                                disabled={updateUserStatusMutation.isPending && actionUserId === user._id}
                                className="p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                              >
                                <Shield className="w-4 h-4" />
                              </motion.button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>
                    Showing {((data.pagination.currentPage - 1) * 10) + 1} to {Math.min(data.pagination.currentPage * 10, data.pagination.totalUsers)} of {data.pagination.totalUsers} users
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(data.pagination.currentPage - 1)}
                    disabled={!data.pagination.hasPrevPage}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                      const page = Math.max(1, data.pagination.currentPage - 2) + i;
                      if (page > data.pagination.totalPages) return null;
                      
                      return (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                            page === data.pagination.currentPage
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                              : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(data.pagination.currentPage + 1)}
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
    </div>
  );
};

export default UserManagement;