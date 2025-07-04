// src/components/profile/JobHistoryList.jsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, IndianRupee, CheckCircle } from "lucide-react";
import SkeletonLoader from "../common/SkeletonLoader";
import EmptyState from "../common/EmptyState";
import api from "../../services/api";

const JobHistoryList = ({ profileId, isOwnProfile }) => {
  // Fetch job history
  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobHistory", profileId],
    queryFn: () => api.job.getUserJobHistory(profileId),
  });

  if (isLoading) {
    return <SkeletonLoader type="list" count={3} />;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
        Error loading job history: {error.message}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <EmptyState
        title="No job history yet"
        description={
          isOwnProfile
            ? "You haven't completed any jobs yet."
            : "This user hasn't completed any jobs yet."
        }
        icon={<Briefcase className="h-12 w-12" />}
        actionText={isOwnProfile ? "Find Jobs" : null}
        actionLink={isOwnProfile ? "/jobs" : null}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {jobs.map((job, index) => (
          <motion.li
            key={job._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {job.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(job.completedDate).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center text-green-600 dark:text-green-400">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {job.budget.toFixed(2)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.domain.color === "blue"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : job.domain.color === "green"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : job.domain.color === "purple"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : job.domain.color === "orange"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {job.domain.name}
                  </span>
                </div>
                {job.feedback && (
                  <div className="mt-2">
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      "{job.feedback}"
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                {job.rating > 0 && (
                  <div className="flex items-center mr-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < job.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  to={`/jobs/${job._id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default JobHistoryList;
