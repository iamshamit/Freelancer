// src/pages/admin/JobModeration.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trash2, Eye, Filter, Briefcase, DollarSign, Calendar,
  ChevronLeft, ChevronRight, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Badge from '../../components/common/Badge';
import Tooltip from '../../components/common/Tooltip';
import api from '../../services/api';

const Avatar = ({ src, alt, size = 'sm', fallback }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
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
        bg-gradient-to-br from-orange-500 to-pink-500 text-white font-medium
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

const JobModeration = ({ darkMode, toggleDarkMode }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    domain: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedJobs, setSelectedJobs] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-jobs', currentPage, filters],
    queryFn: () => api.admin.getJobs({
      page: currentPage,
      limit: 10,
      ...filters
    }),
    keepPreviousData: true
  });

  const removeJobMutation = useMutation({
    mutationFn: ({ jobId, reason }) => api.admin.removeJob(jobId, reason),
    onSuccess: () => {
      toast.success('Job removed successfully');
      queryClient.invalidateQueries(['admin-jobs']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove job');
    }
  });

  const handleRemoveJob = (jobId, jobTitle) => {
    const reason = prompt(`Please provide a reason for removing "${jobTitle}":`);
    
    if (reason !== null && reason.trim()) {
      removeJobMutation.mutate({ jobId, reason: reason.trim() });
    }
  };

  const handleSelectJob = (jobId) => {
    const newSelection = new Set(selectedJobs);
    if (newSelection.has(jobId)) {
      newSelection.delete(jobId);
    } else {
      newSelection.add(jobId);
    }
    setSelectedJobs(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === data?.jobs?.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(data?.jobs?.map(job => job._id) || []));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(budget);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
              Job <span className="text-orange-500">Moderation</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Review and moderate job postings on the platform.
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-6 sm:mt-0">
            <motion.button
              onClick={() => refetch()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
                showFilters 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Total Jobs',
              value: data?.pagination?.totalJobs || 0,
              icon: Briefcase,
              color: 'blue',
              subtitle: 'All job postings'
            },
            {
              title: 'Active Jobs',
              value: data?.stats?.activeJobs || 0,
              icon: CheckCircle,
              color: 'green',
              subtitle: 'Currently active'
            },
            {
              title: 'Pending Review',
              value: data?.stats?.pendingJobs || 0,
              icon: Clock,
              color: 'orange',
              subtitle: 'Awaiting moderation'
            },
            {
              title: 'Total Value',
              value: `$${((data?.stats?.totalValue || 0) / 1000).toFixed(0)}k`,
              icon: DollarSign,
              color: 'purple',
              subtitle: 'Combined budget'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
                <span className={`p-2 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                  stat.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <stat.icon className={`h-5 w-5 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                </span>
              </div>
              {isLoading ? (
                <SkeletonLoader type="text" count={1} />
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
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
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
                
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="">All Domains</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="data-science">Data Science</option>
                  <option value="writing">Writing</option>
                  <option value="marketing">Marketing</option>
                </select>

                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder });
                  }}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all duration-200"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="budget-desc">Highest Budget</option>
                  <option value="budget-asc">Lowest Budget</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Management Table */}
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
                  Job Listings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage job postings and moderate content
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedJobs.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{selectedJobs.size} selected</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader type="table" rows={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedJobs.size === data?.jobs?.length && data?.jobs?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Employer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data?.jobs?.map((job, index) => {
                    const StatusIcon = getStatusIcon(job.status);
                    return (
                      <motion.tr
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedJobs.has(job._id)}
                            onChange={() => handleSelectJob(job._id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                              {job.title}
                            </div>
                            {job.domain && (
                              <div className="flex items-center space-x-2">
                                <Badge color="gray" size="sm" className="capitalize">
                                  {job.domain.replace('-', ' ')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={job.employer?.profilePicture}
                              alt={job.employer?.name}
                              size="sm"
                              fallback={job.employer?.name}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {job.employer?.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {job.employer?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatBudget(job.budget)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-4 h-4 ${
                              job.status === 'active' ? 'text-green-500' :
                              job.status === 'completed' ? 'text-blue-500' :
                              job.status === 'cancelled' ? 'text-red-500' :
                              'text-yellow-500'
                            }`} />
                            <Badge color={getStatusBadgeColor(job.status)} className="capitalize">
                              {job.status}
                            </Badge>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(job.createdAt)}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Tooltip content="View Details">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => window.open(`/job/${job._id}`, '_blank')}
                                className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                            </Tooltip>
                            
                            <Tooltip content="Remove Job">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveJob(job._id, job.title)}
                                disabled={removeJobMutation.isPending}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </Tooltip>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    Showing {((data.pagination.currentPage - 1) * 10) + 1} to {Math.min(data.pagination.currentPage * 10, data.pagination.totalJobs)} of {data.pagination.totalJobs} jobs
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
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
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
    </DashboardLayout>
  );
};

export default JobModeration;