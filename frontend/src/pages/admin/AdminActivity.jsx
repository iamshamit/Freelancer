import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload, FiActivity, FiUser, FiBriefcase, FiShield, FiAlertTriangle } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorFallback from '../../components/common/ErrorFallback';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

// Simple Avatar component defined inline
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
        bg-orange-500 text-white font-medium
        rounded-full flex items-center justify-center
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
        rounded-full object-cover
      `}
    />
  );
};

const AdminActivity = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    adminId: '',
    dateFrom: '',
    dateTo: ''
  });

  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-activity', currentPage, filters],
    queryFn: () => api.admin.getAdminActivity({
      page: currentPage,
      limit: 20,
      ...filters
    }),
    keepPreviousData: true
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_suspension':
        return FiUser;
      case 'job_removal':
        return FiBriefcase;
      case 'dispute_resolution':
        return FiAlertTriangle;
      case 'other':
        return FiActivity;
      default:
        return FiActivity;
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'user_suspension':
        return 'red';
      case 'job_removal':
        return 'orange';
      case 'dispute_resolution':
        return 'blue';
      case 'other':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'user_suspension':
        return 'User Suspended';
      case 'job_removal':
        return 'Job Removed';
      case 'dispute_resolution':
        return 'Dispute Resolved';
      case 'other':
        return 'Other Action';
      default:
        return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback 
        error={error} 
        resetError={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Activity Log
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track all administrative actions and system changes
          </p>
        </div>
        
        <Button variant="outline" className="mt-4 sm:mt-0">
          <FiDownload className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      {/* Activity Log */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Log
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All administrative actions performed on the platform
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Actions</option>
              <option value="user_suspension">User Suspensions</option>
              <option value="user_activation">User Activations</option>
              <option value="job_removal">Job Removals</option>
              <option value="dispute_resolution">Dispute Resolutions</option>
            </select>
            
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="From Date"
            />
            
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              placeholder="To Date"
            />
            
            <Button
              variant="outline"
              onClick={() => setFilters({ action: '', adminId: '', dateFrom: '', dateTo: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Activity List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data?.activities?.map((activity, index) => {
            const ActionIcon = getActionIcon(activity.action);
            
            return (
              <motion.div
                key={`${activity._id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    getActionBadgeColor(activity.action) === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    getActionBadgeColor(activity.action) === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    getActionBadgeColor(activity.action) === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    getActionBadgeColor(activity.action) === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge color={getActionBadgeColor(activity.action)}>
                        {getActionLabel(activity.action)}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 dark:text-white mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {activity.performedBy && (
                          <>
                            <Avatar
                              src={activity.performedBy.profilePicture}
                              alt={activity.performedBy.name}
                              size="sm"
                              fallback={activity.performedBy.name}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.performedBy.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Administrator
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activity.relatedUser && (
                          <Badge color="gray" size="sm">
                            User: {activity.relatedUser.name}
                          </Badge>
                        )}
                        {activity.relatedJob && (
                          <Badge color="gray" size="sm">
                            Job: {activity.relatedJob.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {data?.activities?.length === 0 && (
            <div className="p-12 text-center">
              <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Activity Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No administrative activities match your current filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((data.pagination.currentPage - 1) * 20) + 1} to {Math.min(data.pagination.currentPage * 20, data.pagination.totalActions)} of {data.pagination.totalActions} activities
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(data.pagination.currentPage - 1)}
                  disabled={!data.pagination.hasPrevPage}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                    const page = Math.max(1, data.pagination.currentPage - 2) + i;
                    if (page > data.pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={page}
                        variant={page === data.pagination.currentPage ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(data.pagination.currentPage + 1)}
                  disabled={!data.pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivity;
