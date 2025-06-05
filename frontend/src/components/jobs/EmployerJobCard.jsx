// src/components/jobs/EmployerJobCard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Users, Clock, Eye, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Badge from "../common/Badge";
import JobStatusBadge from "./JobStatusBadge";

const EmployerJobCard = ({ job }) => {
  // Handle case where job is undefined
  if (!job || typeof job !== "object") {
    return null;
  }

  // Destructure with default values
  const {
    _id = "",
    title = "Untitled Job",
    domain = "General",
    budget = 0,
    createdAt = new Date(),
    applicants = [],
    status = "open",
    newApplicants = 0,
    isRatedByEmployer = false,
    freelancer = null,
  } = job;

  // Format date safely
  const formattedDate = () => {
    try {
      return formatDistanceToNow(new Date(createdAt));
    } catch (error) {
      return "recently";
    }
  };

  // Get applicant count
  const applicantsCount = Array.isArray(applicants) ? applicants.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <JobStatusBadge status={status} />
        <div className="flex gap-2">
          {newApplicants > 0 && (
            <Badge variant="danger" className="animate-pulse">
              {newApplicants} new{" "}
              {newApplicants === 1 ? "applicant" : "applicants"}
            </Badge>
          )}
          {status === "completed" && isRatedByEmployer && (
            <Badge variant="success" className="flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Rated
            </Badge>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {title}
      </h3>

      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Posted {formattedDate()} ago</span>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>
            ${typeof budget === "number" ? budget.toFixed(2) : "0.00"}
          </span>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {applicantsCount}{" "}
            {applicantsCount === 1 ? "applicant" : "applicants"}
          </span>
        </div>
      </div>

      {/* Show freelancer info for completed jobs */}
      {status === "completed" && freelancer && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completed by:{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {freelancer.name}
            </span>
          </p>
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-wrap gap-2">
        <Link
          to={`/job/${_id}`}
          className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium flex-grow"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Link>

        {status !== "completed" && (
          <Link
            to={`/employer/jobs/${_id}/applicants`}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium flex-grow"
          >
            <Users className="h-4 w-4 mr-2" />
            View Applicants
          </Link>
        )}

        {/* Rate Freelancer Button - Only show for completed, unrated jobs */}
        {status === "completed" && !isRatedByEmployer && freelancer && (
          <Link
            to={`/job/${_id}/rate-freelancer`}
            className="flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium flex-grow"
          >
            <Star className="h-4 w-4 mr-2" />
            Rate {freelancer.name}
          </Link>
        )}

        {/* View Rating Button - Show for completed, rated jobs */}
        {status === "completed" && isRatedByEmployer && freelancer && (
          <Link
            to={`/profile/${freelancer._id}`}
            className="flex items-center justify-center px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-700 dark:text-green-400 rounded-lg transition-colors font-medium flex-grow"
          >
            <Star className="h-4 w-4 mr-2 fill-current" />
            View Rating
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default EmployerJobCard;