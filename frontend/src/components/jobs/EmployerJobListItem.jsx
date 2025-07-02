// components/jobs/EmployerJobListItem.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Eye, 
  MessageSquare, 
  Target, 
  User,
  Award 
} from "lucide-react";
import { format } from "date-fns";
import Button from "../common/Button";
import Badge from "../common/Badge";
import JobStatusBadge from "./JobStatusBadge";
import api from "../../services/api";

const EmployerJobListItem = ({ job }) => {
  const navigate = useNavigate();
  const hasSelectedFreelancer = job.freelancer;
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
    }
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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          {/* Job info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link to={`/job/${job._id}`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
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

            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-medium">${job.budget}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
              </div>
              {!hasSelectedFreelancer && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Selected Freelancer Info */}
            {hasSelectedFreelancer && job.freelancer && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {job.freelancer.profilePicture ? (
                      <img
                        src={job.freelancer.profilePicture}
                        alt={job.freelancer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/profile/${job.freelancer._id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    >
                      {job.freelancer.name}
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {job.freelancer.averageRating > 0 && (
                        <>
                          <Award className="h-3 w-3 mr-1" />
                          <span>{job.freelancer.averageRating.toFixed(1)} rating</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            {hasSelectedFreelancer ? (
              // Show milestone and chat buttons for jobs with selected freelancer
              <>
                <Link to={`/job/${job._id}/milestones`}>
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Manage Milestones
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMessageFreelancer}
                  isLoading={messageMutation.isPending}
                  disabled={messageMutation.isPending}
                  className="w-full flex items-center justify-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Link to={`/profile/${job.freelancer._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
              </>
            ) : (
              // Show original buttons for jobs without selected freelancer
              <>
                <Link to={`/employer/jobs/${job._id}/applicants`}>
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {applicantCount > 0 ? `View ${applicantCount}` : 'View'} Applicants
                  </Button>
                </Link>
                <Link to={`/job/${job._id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployerJobListItem;