import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiMail, FiCalendar, FiDollarSign, FiBriefcase, FiMessageSquare, FiShield, FiShieldOff, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorFallback from '../../components/common/ErrorFallback';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SkillBadge from '../../components/profile/SkillBadge';
import ReviewCard from '../../components/profile/ReviewCard';

// Simple Avatar component defined inline
const Avatar = ({ src, alt, size = 'md', fallback }) => {
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

const UserDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => api.admin.getUserDetails(id),
    enabled: !!id
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ isActive, reason }) => api.admin.updateUserStatus(id, { isActive, reason }),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['admin-user-detail', id]);
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  });

  const handleStatusChange = (isActive) => {
    const reason = prompt(
      `Please provide a reason for ${isActive ? 'activating' : 'suspending'} this user:`
    );
    
    if (reason !== null && reason.trim()) {
      updateUserStatusMutation.mutate({ isActive, reason: reason.trim() });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
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

  const user = data?.user;
  const stats = data?.statistics;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/users"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Details
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View comprehensive user information and manage account
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-6">
            <Avatar
              src={user?.profilePicture}
              alt={user?.name}
              size="xl"
              fallback={user?.name}
            />
            
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge color={user?.role === 'admin' ? 'red' : user?.role === 'employer' ? 'blue' : 'green'}>
                    {user?.role}
                  </Badge>
                  <Badge color={user?.accountStatus?.isActive !== false ? 'green' : 'red'}>
                    {user?.accountStatus?.isActive !== false ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiMail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FiCalendar className="w-4 h-4" />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
              
              {user?.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bio</h4>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                    {user.bio}
                  </p>
                </div>
              )}
              
              {user?.skills && user.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <SkillBadge key={index} skill={skill} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {user?.accountStatus?.isActive !== false ? (
              <Button
                variant="outline"
                onClick={() => handleStatusChange(false)}
                loading={updateUserStatusMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FiShieldOff className="w-4 h-4 mr-2" />
                Suspend User
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleStatusChange(true)}
                loading={updateUserStatusMutation.isPending}
                className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <FiShield className="w-4 h-4 mr-2" />
                Activate User
              </Button>
            )}
            
            <Button variant="outline">
              <FiMail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Jobs</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalJobs || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stats?.completedJobs || 0} completed
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 text-white rounded-lg">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Earnings</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats?.totalEarnings || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total earned
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500 text-white rounded-lg">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Spending</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats?.totalSpent || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total spent
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Chats</h3>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalChats || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total conversations
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      {user?.ratings && user.ratings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Reviews & Ratings
          </h3>
          
          <div className="space-y-4">
            {user.ratings.slice(0, 5).map((rating, index) => (
              <ReviewCard
                key={index}
                review={{
                  ...rating,
                  reviewer: rating.from
                }}
              />
            ))}
          </div>
          
          {user.ratings.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline">
                View All Reviews ({user.ratings.length})
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UserDetailPage;