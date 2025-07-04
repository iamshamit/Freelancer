// components/jobs/EmployerJobCard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Target,
  User,
  Award,
  Star,
  Archive,
  IndianRupee
} from "lucide-react";
import { format } from "date-fns";
import Button from "../common/Button";
import Badge from "../common/Badge";
import JobStatusBadge from "./JobStatusBadge";
import api from "../../services/api";

const EmployerJobCard = ({ job }) => {
  const navigate = useNavigate();
  const hasSelectedFreelancer = job.freelancer;
  const isCompleted = job.status === "completed";
  const applicantCount = job.applicants?.length || 0;

  // Message freelancer mutation
  const messageMutation = useMutation({
    mutationFn: () => api.chat.create(job._id),
    onSuccess: (data) => {
      navigate(`/chat/${data?._id || ""}`);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      // You might want to show a toast notification here
    },
  });

  const handleMessageFreelancer = (e) => {
    e.preventDefault();
    messageMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link to={`/job/${job._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors line-clamp-2">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              <JobStatusBadge status={job.status} />
              {hasSelectedFreelancer && (
                <Badge variant="success" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Freelancer Selected
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {job.description}
        </p>

        {/* Job details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <IndianRupee className="h-4 w-4 mr-2" />
            <span className="font-medium">{job.budget}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
          </div>
          {!hasSelectedFreelancer && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Selected Freelancer Info */}
        {hasSelectedFreelancer && job.freelancer && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {job.freelancer.profilePicture ? (
                  <img
                    src={job.freelancer.profilePicture}
                    alt={job.freelancer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${job.freelancer._id}`}
                  className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors truncate block"
                >
                  {job.freelancer.name}
                </Link>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  {job.freelancer.averageRating > 0 && (
                    <>
                      <Award className="h-3 w-3 mr-1" />
                      <span>{job.freelancer.averageRating.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {hasSelectedFreelancer ? (
            isCompleted ? (
              // Show ratings and archived chats for completed jobs
              <>
                <Link to={`/job/${job._id}/rating`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Rate Work
                  </Button>
                </Link>
                <Link to={`/chat/${job._id}/archived`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archived Chats
                  </Button>
                </Link>
              </>
            ) : (
              // Show milestone and chat buttons for active jobs with selected freelancer
              <>
                <Link to={`/job/${job._id}/milestones`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0"
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Milestones
                  </Button>
                </Link>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMessageFreelancer}
                    isLoading={messageMutation.isPending}
                    disabled={messageMutation.isPending}
                    className="w-full flex items-center justify-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </>
            )
          ) : (
            // Show original buttons for jobs without selected freelancer
            <>
              <Link
                to={`/employer/jobs/${job._id}/applicants`}
                className="flex-1"
              >
                <Button
                  size="sm"
                  className="w-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0"
                >
                  <Users className="h-4 w-4 mr-1" />
                  {applicantCount > 0 ? `View ${applicantCount}` : "View"}{" "}
                  Applicants
                </Button>
              </Link>
              <Link to={`/job/${job._id}`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployerJobCard;
