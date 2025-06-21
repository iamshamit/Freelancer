import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  Activity,
  Shield,
  Server,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  LogOut
} from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import SystemHealthCard from '../../components/admin/SystemHealthCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorFallback from '../../components/common/ErrorFallback';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [timeRange, setTimeRange] = useState('30d');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch dashboard statistics
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin-dashboard-stats', timeRange],
    queryFn: () => api.admin.getDashboardStats(timeRange),
    refetchInterval: 30000
  });

  // Fetch system health
  const { 
    data: systemHealth, 
    isLoading: healthLoading, 
    error: healthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: api.admin.getSystemHealth,
    refetchInterval: 60000
  });

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const handleRefresh = () => {
    refetchStats();
    refetchHealth();
  };

  if (statsLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (statsError || healthError) {
    return (
      <div className="p-6">
        <ErrorFallback 
          error={statsError || healthError} 
          resetError={() => window.location.reload()} 
        />
      </div>
    );
  }

  const mainStats = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      subtitle: `${stats?.overview?.totalFreelancers || 0} freelancers, ${stats?.overview?.totalEmployers || 0} employers`,
      icon: Users,
      color: 'blue',
      trend: 'up',
      trendValue: stats?.recentActivity?.newUsersLast30Days || 0,
      change: '+12.5%'
    },
    {
      title: 'Active Jobs',
      value: stats?.overview?.activeJobs || 0,
      subtitle: `${stats?.overview?.totalJobs || 0} total jobs posted`,
      icon: Briefcase,
      color: 'green',
      trend: 'up',
      trendValue: stats?.recentActivity?.newJobsLast30Days || 0,
      change: '+8.2%'
    },
    {
      title: 'Platform Revenue',
      value: `$${(stats?.overview?.totalTransactionAmount || 0).toLocaleString()}`,
      subtitle: `${stats?.overview?.totalTransactions || 0} transactions`,
      icon: DollarSign,
      color: 'orange',
      trend: 'up',
      trendValue: stats?.recentActivity?.transactionsLast30Days || 0,
      change: '+18.9%'
    },
    {
      title: 'System Health',
      value: systemHealth?.overallHealth || 'Good',
      subtitle: `${systemHealth?.activeConnections || 0} active connections`,
      icon: Activity,
      color: systemHealth?.overallHealth === 'Good' ? 'green' : 'red',
      trend: systemHealth?.overallHealth === 'Good' ? 'up' : 'down'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      color: 'blue',
      path: '/admin/users',
      count: stats?.overview?.totalUsers || 0
    },
    {
      title: 'Job Moderation',
      description: 'Review and moderate job postings',
      icon: Briefcase,
      color: 'green',
      path: '/admin/jobs',
      count: stats?.overview?.pendingJobs || 0
    },
    {
      title: 'Security Center',
      description: 'Monitor security and compliance',
      icon: Shield,
      color: 'purple',
      path: '/admin/security',
      count: systemHealth?.securityAlerts || 0
    },
    {
      title: 'System Monitor',
      description: 'View system performance metrics',
      icon: Server,
      color: 'orange',
      path: '/admin/system',
      status: systemHealth?.overallHealth || 'Good'
    }
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-pink-500/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-purple-500/10 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/5 to-blue-500/5 rounded-full filter blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Monitor platform performance and system health
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            {/* Logout Button */}
            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </motion.button>

            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            {/* Enhanced Time Range Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[160px]"
              >
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">
                  {timeRangeOptions.find(option => option.value === timeRange)?.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {timeRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTimeRange(option.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                          timeRange === option.value
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
                  stat.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                  stat.color === 'green' ? 'from-green-500 to-emerald-500' :
                  stat.color === 'orange' ? 'from-orange-500 to-red-500' :
                  'from-purple-500 to-pink-500'
                }`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      stat.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                      stat.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                      'bg-purple-50 dark:bg-purple-900/20'
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`} />
                    </div>
                    {stat.change && (
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        stat.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>{stat.change}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
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

        {/* System Health & Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced System Health */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Health
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  All Systems Operational
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'API Response Time', value: '127ms', status: 'good', icon: Zap },
                { name: 'Database Performance', value: '99.9%', status: 'good', icon: Server },
                { name: 'Active Users', value: systemHealth?.activeConnections || 0, status: 'good', icon: Users },
                { name: 'Error Rate', value: '0.01%', status: 'good', icon: AlertTriangle }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <metric.icon className={`w-4 h-4 ${
                      metric.status === 'good' ? 'text-green-500' : 'text-red-500'
                    }`} />
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

          {/* Enhanced Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Last 30 days</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  label: 'New User Registrations',
                  value: stats?.recentActivity?.newUsersLast30Days || 0,
                  icon: Users,
                  color: 'blue',
                  change: '+12.5%'
                },
                {
                  label: 'Job Postings',
                  value: stats?.recentActivity?.newJobsLast30Days || 0,
                  icon: Briefcase,
                  color: 'green',
                  change: '+8.2%'
                },
                {
                  label: 'Transactions Processed',
                  value: stats?.recentActivity?.transactionsLast30Days || 0,
                  icon: DollarSign,
                  color: 'orange',
                  change: '+18.9%'
                },
                {
                  label: 'Active Conversations',
                  value: stats?.overview?.activeChats || 0,
                  icon: MessageSquare,
                  color: 'purple',
                  change: '+5.3%'
                }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.color === 'blue' ? 'bg-blue-500' :
                      activity.color === 'green' ? 'bg-green-500' :
                      activity.color === 'orange' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}>
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
                        <ArrowUp className="w-3 h-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`}>
                    {activity.value.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Popular Job Domains */}
        {stats?.growth?.jobsByDomain?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Popular Job Domains
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.growth.jobsByDomain.slice(0, 6).map((domain, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize mb-2">
                    {domain._id || 'Other'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {domain.count}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Avg Budget
                      </div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        ${Math.round(domain.avgBudget || 0)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.a
                key={index}
                href={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                  action.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                  action.color === 'green' ? 'from-green-500 to-emerald-500' :
                  action.color === 'orange' ? 'from-orange-500 to-red-500' :
                  'from-purple-500 to-pink-500'
                }`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      action.color === 'blue' ? 'bg-blue-500' :
                      action.color === 'green' ? 'bg-green-500' :
                      action.color === 'orange' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    {action.count !== undefined && (
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        action.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        action.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        action.color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {action.count}
                      </div>
                    )}
                    {action.status && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.status === 'Good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {action.status}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;