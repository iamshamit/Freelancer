// src/pages/dashboard/FreelancerDashboard.jsx
import { useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Clock, Archive, Send, TrendingUp, 
  DollarSign, Users, ChevronRight, Search, Check, X, MessageSquare
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import JobRecommendations from '../../components/search/JobRecommendations';
import AuthContext from '../../context/AuthContext';
import api from '../../services/api';

const FreelancerDashboard = ({ darkMode, toggleDarkMode }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('recommended');
  
  // Fetch user profile for stats
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: api.user.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch freelancer jobs (applied, assigned, completed)
  const { data: freelancerJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['freelancerJobs'],
    queryFn: api.job.getFreelancerJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch applied jobs for recent applications
  const { data: appliedJobs, isLoading: applicationsLoading } = useQuery({
    queryKey: ['appliedJobs'],
    queryFn: api.job.getAppliedJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.payment.getHistory(),
  });
  
  // Calculate stats from fetched data
  const stats = {
    name: user?.name || profile?.name || 'Freelancer',
    totalEarnings: payments.reduce((sum, p) => sum + p.amount, 0) || 0,
    earningsGrowth: 12, // This would come from backend calculation
    completedJobs: profile?.completedJobs || 0,
    activeJobs: freelancerJobs?.assigned?.length || 0,
    successRate: profile?.completedJobs > 0 ? Math.round((profile?.completedJobs / (profile?.completedJobs + 2)) * 100) : 0,
    activeJobsList: freelancerJobs?.assigned || []
  };

  // Get recent applications (last 5)
  const recentApplications = appliedJobs?.slice(0, 5).map(job => ({
    _id: job._id,
    job: {
      title: job.title,
      _id: job._id
    },
    status: job.applicationStatus || 'pending',
    timeAgo: getTimeAgo(job.applicants?.find(a => a.freelancer === user?._id)?.appliedAt || job.createdAt)
  })) || [];

  // Helper function to calculate time ago
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }

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

  const isLoading = profileLoading || jobsLoading;

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
            Welcome back, <span className="text-orange-500">{stats.name}</span>
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's what's happening with your freelancing today.
          </p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Earnings card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</h3>
              <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </span>
            </div>
            {paymentsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    +{stats.earningsGrowth}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    from last month
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Jobs completed card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Jobs Completed</h3>
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </span>
            </div>
            {paymentsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedJobs}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Lifetime total
            </div>
          </motion.div>

          {/* Active jobs card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</h3>
              <span className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </span>
            </div>
            {paymentsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeJobs}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Currently in progress
            </div>
          </motion.div>

          {/* Success rate card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</h3>
              <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </span>
            </div>
            {isLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.successRate}%
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Job completion rate
            </div>
          </motion.div>
        </motion.div>

        {/* Job Recommendations Section */}
        <JobRecommendations limit={3} />

        {/* Recent applications */}
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
            Recent Applications
          </motion.h2>

          {applicationsLoading ? (
            <SkeletonLoader type="list" count={3} />
          ) : recentApplications.length > 0 ? (
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentApplications.slice(0, 3).map((application) => (
                  <li key={application._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link to={`/jobs/${application._id}`} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          application.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          application.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          application.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {application.status === 'pending' ? <Clock className="h-5 w-5" /> :
                           application.status === 'accepted' ? <Check className="h-5 w-5" /> :
                           application.status === 'rejected' ? <X className="h-5 w-5" /> :
                           <Send className="h-5 w-5" />}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.job.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Applied {application.timeAgo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <ChevronRight className="h-4 w-4 ml-2 text-gray-400" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <Send className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't applied to any jobs yet. Start browsing available jobs and submit your first application.
              </p>
              <Link 
                to="/jobs"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                Find Jobs
              </Link>
            </motion.div>
          )}

          {recentApplications.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="mt-6 text-center"
            >
              <Link 
                to="/applications" 
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
              >
                View all applications
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Active jobs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Active Jobs
          </motion.h2>

          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : stats.activeJobs > 0 ? (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {stats.activeJobsList.slice(0, 2).map((job) => (
                <div 
                  key={job._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h3>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{job.employer?.name}</span>
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${job.budget}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{job.milestonePercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${job.milestonePercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link 
                      to={`/chat`}
                      className="flex-1 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Link>
                    <Link 
                      to={`/milestones/${job._id}`}
                      className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                    >
                      Milestones
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <Briefcase className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active jobs
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have any active jobs at the moment. Apply to jobs to start working.
              </p>
              <Link 
                to="/jobs"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                Find Jobs
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDashboard;