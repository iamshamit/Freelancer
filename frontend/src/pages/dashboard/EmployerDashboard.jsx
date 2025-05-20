// src/pages/dashboard/EmployerDashboard.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Clock, Users, Plus, TrendingUp, 
  DollarSign, ChevronRight, Search, MessageSquare
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const EmployerDashboard = () => {
  // Fetch employer stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['employerStats'],
    queryFn: () => api.job.getEmployerStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch posted jobs
  const { data: postedJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['postedJobs'],
    queryFn: () => api.job.getPostedJobs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch jobs with applicants
  const { data: jobsWithApplicants, isLoading: applicantsLoading } = useQuery({
    queryKey: ['jobsWithApplicants'],
    queryFn: () => api.job.getJobsWithApplicants(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    <DashboardLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Welcome section with post job button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="text-orange-500">{stats?.name || 'Employer'}</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your projects and find talented freelancers.
            </p>
          </div>
          <Link 
            to="/employer/post-job"
            className="mt-4 sm:mt-0 inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post a Job
          </Link>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Posted jobs card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Posted Jobs</h3>
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </span>
            </div>
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.postedJobs || 0}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Total jobs posted
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
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.activeJobs || 0}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Currently in progress
            </div>
          </motion.div>

          {/* Total applicants card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applicants</h3>
              <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </span>
            </div>
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalApplicants || 0}
              </p>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Across all jobs
            </div>
          </motion.div>

          {/* Budget spent card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Spent</h3>
              <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </span>
            </div>
            {statsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats?.budgetSpent?.toFixed(2) || '0.00'}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    +{stats?.budgetGrowth || 0}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    from last month
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Posted jobs section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <motion.h2 
              variants={itemVariants}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Your Posted Jobs
            </motion.h2>
            <motion.div 
              variants={itemVariants}
              className="mt-3 sm:mt-0"
            >
              <Link 
                to="/employer/jobs"
                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors font-medium text-sm"
              >
                View All Jobs
              </Link>
            </motion.div>
          </div>

          {/* Job listings */}
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : postedJobs?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.slice(0, 3).map((job) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.domain.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      job.domain.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      job.domain.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      job.domain.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {job.domain.name}
                    </span>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${job.budget.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {job.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Posted {job.timeAgo}</span>
                    {job.applicantsCount > 0 && (
                      <div className="ml-4 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/employer/jobs/${job._id}`}
                    className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                  >
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <Briefcase className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't posted any jobs yet. Create your first job posting to find talented freelancers.
              </p>
              <Link 
                to="/employer/post-job"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Job
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Jobs with applicants section */}
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
            Jobs with Applicants
          </motion.h2>

          {applicantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : jobsWithApplicants?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobsWithApplicants.slice(0, 2).map((job) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.domain.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      job.domain.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      job.domain.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      job.domain.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {job.domain.name}
                    </span>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${job.budget.toFixed(2)}</span>
                    </div>
                  </div>
                  
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">{job.applicantsCount}</span>
                    <span className="ml-1">applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
                  </div>
                  
                  {/* Recent applicants preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Recent Applicants
                    </h4>
                    <div className="space-y-2">
                      {job.recentApplicants?.slice(0, 2).map((applicant) => (
                        <div 
                          key={applicant._id}
                          className="flex items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <img 
                            src={applicant.profilePicture || "/default-avatar.png"} 
                            alt={applicant.name}
                            className="w-8 h-8 rounded-full object-cover mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {applicant.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>{applicant.completedJobs || 0} jobs completed</span>
                              {applicant.rating > 0 && (
                                <div className="flex items-center ml-2">
                                  <span className="text-yellow-500">★</span>
                                  <span className="ml-1">{applicant.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/employer/jobs/${job._id}/applicants`}
                    className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                  >
                    View All Applicants
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No applicants yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your posted jobs don't have any applicants yet. Check back later or post more jobs to attract freelancers.
              </p>
              <Link 
                to="/employer/post-job"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Job
              </Link>
            </motion.div>
          )}

          {jobsWithApplicants?.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="mt-6 text-center"
            >
              <Link 
                to="/employer/applicants" 
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
              >
                View all jobs with applicants
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Active jobs section */}
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

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : stats?.activeJobs > 0 ? (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {stats.activeJobsList?.slice(0, 2).map((job) => (
                <div 
                  key={job._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.domain.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      job.domain.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      job.domain.color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      job.domain.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {job.domain.name}
                    </span>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${job.budget.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <img 
                      src={job.freelancer.profilePicture || "/default-avatar.png"} 
                      alt={job.freelancer.name}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Freelancer: {job.freelancer.name}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-orange-500 h-2.5 rounded-full" 
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link 
                      to={`/chat/${job.chatId}`}
                      className="flex-1 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Link>
                    <Link 
                      to={`/jobs/${job._id}/milestones`}
                      className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
                    >
                      Details
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
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active jobs
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have any active jobs at the moment. Post jobs and select freelancers to start working.
              </p>
              <Link 
                to="/employer/post-job"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Job
              </Link>
            </motion.div>
          )}

          {stats?.activeJobs > 0 && (
            <motion.div 
              variants={itemVariants}
              className="mt-6 text-center"
            >
              <Link 
                to="/employer/jobs/active" 
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
              >
                View all active jobs
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;