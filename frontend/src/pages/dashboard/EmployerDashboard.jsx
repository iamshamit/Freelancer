// src/pages/dashboard/EmployerDashboard.jsx
import { useMemo, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock,
  Users,
  Plus,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Search,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

// Helper function to calculate time ago - defined outside component
const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
};

const EmployerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mutation for creating chat
  const messageMutation = useMutation({
    mutationFn: (jobId) => api.chat.create(jobId),
    onSuccess: (data) => {
      navigate(`/chat/${data?._id || ""}`);
    },
  });

  // Fetch all employer jobs and calculate stats from them
  const { data: allJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: () => api.job.getEmployerJobs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate stats from the jobs data
  const stats = useMemo(() => {
    if (!allJobs) return null;

    const postedJobs = allJobs.length;
    const activeJobs = allJobs.filter(
      (job) => job.status === "assigned",
    ).length;
    const completedJobs = allJobs.filter((job) => job.status === "completed");
    const totalApplicants = allJobs.reduce(
      (total, job) => total + (job.applicants?.length || 0),
      0,
    );
    const budgetSpent = completedJobs.reduce(
      (total, job) => total + job.budget,
      0,
    );

    // Calculate budget growth (mock calculation - you can replace with real logic)
    const budgetGrowth =
      completedJobs.length > 0
        ? Math.round((completedJobs.length / postedJobs) * 100)
        : 0;

    // Get active jobs list - only jobs with status 'assigned'
    const activeJobsList = allJobs
      .filter((job) => job.status === "assigned")
      .map((job) => ({
        ...job,
        progress: Math.floor(Math.random() * 80) + 10, // Mock progress - replace with real milestone data
      }));

    return {
      name: user?.name || "Employer",
      postedJobs,
      activeJobs,
      totalApplicants,
      budgetSpent,
      budgetGrowth,
      activeJobsList,
    };
  }, [allJobs, user]);

  // Get recent posted jobs - only show open jobs (not assigned or completed)
  const postedJobs = useMemo(() => {
    if (!allJobs) return [];

    return allJobs
      .filter((job) => job.status === "open") // Only show open jobs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((job) => ({
        ...job,
        timeAgo: getTimeAgo(job.createdAt),
        applicantsCount: job.applicants?.length || 0,
      }));
  }, [allJobs]);

  // Get jobs with applicants - only show open jobs with applicants
  const jobsWithApplicants = useMemo(() => {
    if (!allJobs) return [];

    return allJobs
      .filter(
        (job) =>
          job.status === "open" && // Only open jobs
          job.applicants &&
          job.applicants.length > 0,
      )
      .sort((a, b) => b.applicants.length - a.applicants.length)
      .slice(0, 4)
      .map((job) => ({
        ...job,
        applicantsCount: job.applicants.length,
      }));
  }, [allJobs]);

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
              Welcome back,{" "}
              <span className="text-orange-500">
                {stats?.name || "Employer"}
              </span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your projects and find talented freelancers.
            </p>
          </div>
          <Link
            to="/jobs/post"
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Posted Jobs
              </h3>
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </span>
            </div>
            {jobsLoading ? (
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Jobs
              </h3>
              <span className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </span>
            </div>
            {jobsLoading ? (
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Applicants
              </h3>
              <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </span>
            </div>
            {jobsLoading ? (
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
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Budget Spent
              </h3>
              <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </span>
            </div>
            {jobsLoading ? (
              <SkeletonLoader type="text" count={1} />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats?.budgetSpent?.toFixed(2) || "0.00"}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">
                    +{stats?.budgetGrowth || 0}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    completion rate
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Posted jobs section - Only showing open jobs */}
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
              Your Open Jobs
            </motion.h2>
            <motion.div variants={itemVariants} className="mt-3 sm:mt-0">
              <Link
                to="/employer/jobs"
                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors font-medium text-sm"
              >
                View All Jobs
              </Link>
            </motion.div>
          </div>

          {/* Job listings as list */}
          {jobsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader key={i} type="text" count={2} />
              ))}
            </div>
          ) : postedJobs?.length > 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {postedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Open
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {job.domain?.name || "General"}
                          </span>
                          <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>${job.budget?.toFixed(2) || "0.00"}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {job.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Posted {job.timeAgo}</span>
                          {job.applicantsCount > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <Users className="h-4 w-4 mr-1" />
                              <span>
                                {job.applicantsCount} applicant
                                {job.applicantsCount !== 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="ml-6">
                        <Link
                          to={`/job/${job._id}`}
                          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                No open jobs
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have any open jobs accepting applications. Post a new
                job to start receiving applications from freelancers.
              </p>
              <Link
                to="/jobs/post"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Job
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Jobs with applicants section - Only showing open jobs with applicants */}
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

          {jobsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader key={i} type="text" count={2} />
              ))}
            </div>
          ) : jobsWithApplicants?.length > 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {jobsWithApplicants.map((job) => (
                  <div
                    key={job._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Open
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {job.domain?.name || "General"}
                          </span>
                          <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>${job.budget?.toFixed(2) || "0.00"}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h3>

                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {job.applicantsCount}
                          </span>
                          <span className="ml-1">
                            applicant{job.applicantsCount !== 1 ? "s" : ""}{" "}
                            waiting for review
                          </span>
                        </div>

                        {/* Show applicant count only since freelancer details aren't populated */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {job.applicantsCount} freelancer
                            {job.applicantsCount !== 1 ? "s" : ""} applied
                          </span>
                        </div>
                      </div>

                      <div className="ml-6">
                        <Link
                          to={`/employer/jobs/${job._id}/applicants`}
                          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
                        >
                          Review Applicants
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
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
                Your open jobs don't have any applicants yet. Check back later
                or promote your jobs to attract more freelancers.
              </p>
              <Link
                to="/jobs/post"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Job
              </Link>
            </motion.div>
          )}

          {jobsWithApplicants?.length > 0 && (
            <motion.div variants={itemVariants} className="mt-6 text-center">
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

        {/* Active jobs section - Only showing assigned jobs */}
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
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <SkeletonLoader key={i} type="text" count={2} />
              ))}
            </div>
          ) : stats?.activeJobs > 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.activeJobsList?.slice(0, 4).map((job) => (
                  <div
                    key={job._id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                            In Progress
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {job.domain?.name || "General"}
                          </span>
                          <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>${job.budget?.toFixed(2) || "0.00"}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {job.title}
                        </h3>

                        <div className="flex items-center mb-3">
                          <img
                            src={
                              job.freelancer?.profilePicture ||
                              "/default-avatar.png"
                            }
                            alt={job.freelancer?.name || "Freelancer"}
                            className="w-6 h-6 rounded-full object-cover mr-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Freelancer: {job.freelancer?.name || "Unknown"}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div className="flex-1 max-w-xs">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{job.milestonePercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.milestonePercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex space-x-3">
                        <button
                          onClick={() => messageMutation.mutate(job._id)}
                          disabled={messageMutation.isPending}
                          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </button>
                        <Link
                          to={`/job/${job._id}/milestones`}
                          className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                You don't have any jobs in progress. Select freelancers from
                your job applications to start working together.
              </p>
              <Link
                to="/jobs/post"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post a Job
              </Link>
            </motion.div>
          )}

          {stats?.activeJobs > 0 && (
            <motion.div variants={itemVariants} className="mt-6 text-center">
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
