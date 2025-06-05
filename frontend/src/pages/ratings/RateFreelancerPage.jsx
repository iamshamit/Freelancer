import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle, Star } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import RatingForm from "../../components/ratings/RatingForm";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import api from "../../services/api";

const RateFreelancerPage = ({ darkMode, toggleDarkMode }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useContext(AuthContext);

  // Fetch job details for rating
  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobDetailsForRating", jobId],
    queryFn: () => api.job.getById(jobId),
    enabled: !!jobId && !!loggedInUser,
  });

  const handleRatingSuccess = () => {
    // Navigate back to employer jobs page
    navigate("/employer/jobs");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Error Loading Job"
            description={
              error.response?.data?.message ||
              "There was an error loading the job details."
            }
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            onAction={handleGoBack}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Job not found
  if (!job) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Job Not Found"
            description="The job you're trying to rate doesn't exist or you don't have permission to access it."
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            onAction={handleGoBack}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Authorization check - only job employer can rate
  if (job.employer._id !== loggedInUser._id) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Not Authorized"
            description="You don't have permission to rate this freelancer. Only the job employer can submit ratings."
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            onAction={handleGoBack}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Job status check - only completed jobs can be rated
  if (job.status !== "completed") {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Job Not Completed"
            description="This job is not yet completed and cannot be rated. You can only rate freelancers after the job is 100% complete."
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            onAction={handleGoBack}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Already rated check
  if (job.isRatedByEmployer) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState
              title="Already Rated"
              description={`You have already rated ${job.freelancer?.name || "this freelancer"} for this job.`}
              icon={<CheckCircle className="h-12 w-12 text-green-500" />}
              actionText="View Freelancer Profile"
              actionLink={`/profile/${job.freelancer?._id}`}
              secondaryActionText="Back to Jobs"
              onSecondaryAction={() => navigate("/employer/jobs")}
            />
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Main rating form
  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="mb-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rate Freelancer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your experience working with{" "}
              {job.freelancer?.name || "this freelancer"} on "{job.title}"
            </p>
          </div>

          {/* Job Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Freelancer:{" "}
                  <span className="font-medium">{job.freelancer?.name}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Budget:{" "}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${job.budget?.toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Form */}
          <RatingForm
            jobId={jobId}
            freelancerName={job.freelancer?.name}
            onSubmitSuccess={handleRatingSuccess}
            onCancel={handleGoBack}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default RateFreelancerPage;