// src/pages/applications/ApplicantReviewPage.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  ChevronLeft,
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  Filter,
  SortAsc,
  Star,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Award,
  MapPin,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import api from "../../services/api";

const ApplicantReviewPage = ({ darkMode, toggleDarkMode }) => {
  // Use jobId from URL params
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch job details with populated applicants
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.job.getById(jobId),
    enabled: !!jobId,
  });

  // Accept applicant mutation
  const acceptMutation = useMutation({
    mutationFn: (freelancerId) => api.job.selectFreelancer(jobId, freelancerId),
    onSuccess: () => {
      queryClient.invalidateQueries(["job", jobId]);
    },
  });

  // Message applicant mutation
  const messageMutation = useMutation({
    mutationFn: () => api.chat.create(jobId),
    onSuccess: (data) => {
      navigate(`/chat/${data?._id || ""}`);
    },
  });

  // Loading state
  const isLoading = jobLoading;
  const error = jobError;

  // Handle applicant selection
  const handleSelectApplicant = (applicant) => {
    setSelectedApplicant(applicant);
  };

  // Handle accept applicant
  const handleAcceptApplicant = (freelancerId) => {
    acceptMutation.mutate(freelancerId);
  };

  // Handle message applicant
  const handleMessageApplicant = () => {
    messageMutation.mutate();
  };

  // Process applicants data
  const processApplicants = () => {
    if (!job || !job.applicants) return [];

    // Create a copy of applicants with additional data
    let applicantsData = job.applicants.map((app) => {
      const isAssigned =
        job.freelancer && job.freelancer === app.freelancer._id;
      return {
        _id: app._id,
        freelancer: app.freelancer,
        appliedAt: app.appliedAt,
        status: isAssigned ? "assigned" : "pending",
      };
    });

    // Filter by status
    if (filterStatus !== "all") {
      applicantsData = applicantsData.filter(
        (app) => app.status === filterStatus,
      );
    }

    // Sort applicants
    applicantsData.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.appliedAt) - new Date(b.appliedAt);
        case "rating": {
          const ratingA = a.freelancer?.averageRating || 0;
          const ratingB = b.freelancer?.averageRating || 0;
          return ratingB - ratingA;
        }
        case "newest":
        default:
          return new Date(b.appliedAt) - new Date(a.appliedAt);
      }
    });

    return applicantsData;
  };

  const filteredApplicants = processApplicants();

  if (isLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" height="100px" className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <SkeletonLoader type="card" height="400px" />
            </div>
            <div className="md:col-span-2">
              <SkeletonLoader type="card" height="600px" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmptyState
            title="Error Loading Applicants"
            description={
              error.message || "There was an error loading the applicants."
            }
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            actionLink="/employer/jobs"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmptyState
            title="Job Not Found"
            description="The job you're looking for doesn't exist or has been removed."
            icon={<Briefcase className="h-12 w-12" />}
            actionText="View All Jobs"
            actionLink="/employer/jobs"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/employer/jobs"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Jobs</span>
          </Link>
        </div>

        {/* Job header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Applicants for: {job.title}
                </h1>
                <div className="flex items-center gap-3">
                  <JobStatusBadge status={job.status} />
                  <span className="text-gray-500 dark:text-gray-400">
                    ${job.budget} • Posted on{" "}
                    {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Users className="h-5 w-5 mr-1" />
                  <span>
                    {filteredApplicants.length} applicant
                    {filteredApplicants.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <Link to={`/job/${jobId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200"
                  >
                    View Job Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300 mr-2">
                Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
              >
                <option value="all">All Applicants</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>

            <div className="flex items-center">
              <SortAsc className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300 mr-2">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main content */}
        {filteredApplicants.length === 0 ? (
          <EmptyState
            title="No Applicants Found"
            description={
              filterStatus !== "all"
                ? `No ${filterStatus} applicants found. Try changing your filter.`
                : "No one has applied to this job yet. Check back later or consider updating your job posting."
            }
            icon={<Users className="h-12 w-12" />}
            actionText={
              filterStatus !== "all" ? "Show All Applicants" : "Edit Job"
            }
            actionLink={
              filterStatus !== "all" ? null : `/employer/jobs/${jobId}/edit`
            }
            onAction={
              filterStatus !== "all" ? () => setFilterStatus("all") : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Applicant list */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Applicants ({filteredApplicants.length})
                  </h2>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {filteredApplicants.map((applicant) => (
                      <div
                        key={applicant._id}
                        onClick={() => handleSelectApplicant(applicant)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedApplicant?._id === applicant._id
                            ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                            : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                        } border ${
                          selectedApplicant?._id === applicant._id
                            ? "border-orange-200 dark:border-orange-800"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {applicant.freelancer?.profilePicture ? (
                              <img
                                src={applicant.freelancer.profilePicture}
                                alt={applicant.freelancer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {applicant.freelancer?.name ||
                                  "Anonymous Freelancer"}
                              </h3>
                              <Badge
                                variant={
                                  job.freelancer &&
                                  job.freelancer._id ===
                                    applicant.freelancer._id
                                    ? "success"
                                    : "default"
                                }
                                className="ml-2 text-xs"
                              >
                                {job.freelancer &&
                                job.freelancer._id === applicant.freelancer._id
                                  ? "Selected"
                                  : "Pending"}
                              </Badge>
                            </div>

                            <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {applicant.freelancer?.averageRating > 0 && (
                                <div className="flex items-center mr-3">
                                  <Star
                                    className="h-3.5 w-3.5 text-yellow-400 mr-1"
                                    fill="currentColor"
                                  />
                                  <span>
                                    {applicant.freelancer.averageRating.toFixed(
                                      1,
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>
                                  {format(
                                    new Date(applicant.appliedAt),
                                    "MMM d",
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant details */}
            <div className="md:col-span-2">
              {selectedApplicant ? (
                <motion.div
                  key={selectedApplicant._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    {/* Applicant header */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          {console.log(selectedApplicant)}
                          {selectedApplicant.freelancer?.profilePicture ? (
                            <img
                              src={selectedApplicant.freelancer.profilePicture}
                              alt={selectedApplicant.freelancer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                              <User className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {selectedApplicant.freelancer?.name ||
                              "Anonymous Freelancer"}
                          </h2>
                          <div className="flex items-center mt-1">
                            {selectedApplicant.freelancer?.averageRating >
                              0 && (
                              <div className="flex items-center mr-4">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i <
                                        Math.floor(
                                          selectedApplicant.freelancer
                                            .averageRating,
                                        )
                                          ? "text-yellow-400"
                                          : "text-gray-300 dark:text-gray-600"
                                      }`}
                                      fill={
                                        i <
                                        Math.floor(
                                          selectedApplicant.freelancer
                                            .averageRating,
                                        )
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                  {selectedApplicant.freelancer.averageRating.toFixed(
                                    1,
                                  )}
                                  {selectedApplicant.freelancer.ratings
                                    ?.length > 0 && (
                                    <span className="ml-1">
                                      (
                                      {
                                        selectedApplicant.freelancer.ratings
                                          .length
                                      }{" "}
                                      reviews)
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <Badge
                              variant={
                                job.freelancer &&
                                job.freelancer._id ===
                                  selectedApplicant.freelancer._id
                                  ? "success"
                                  : "default"
                              }
                              className="ml-2 text-xs"
                            >
                              {job.freelancer &&
                              job.freelancer._id ===
                                selectedApplicant.freelancer._id
                                ? "Selected"
                                : "Pending"}
                            </Badge>
                          </div>

                          {/* Completed jobs count */}
                          {selectedApplicant.freelancer?.completedJobs > 0 && (
                            <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <Award className="h-4 w-4 mr-1" />
                              <span>
                                {selectedApplicant.freelancer.completedJobs}{" "}
                                jobs completed
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.status === "open" &&
                          selectedApplicant.status !== "assigned" && (
                            <Button
                              onClick={() =>
                                handleAcceptApplicant(
                                  selectedApplicant.freelancer._id,
                                )
                              }
                              isLoading={acceptMutation.isPending}
                              disabled={acceptMutation.isPending}
                              className="flex items-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-0 transition-all duration-200 transform hover:scale-105"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          )}

                        {/* Milestone button - only show when freelancer is accepted */}
                        {job.freelancer &&
                          job.freelancer._id ===
                            selectedApplicant.freelancer._id && (
                            <Link to={`/job/${jobId}/milestones`}>
                              <Button
                                variant="outline"
                                className="flex items-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200 transform hover:scale-105"
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Milestones
                              </Button>
                            </Link>
                          )}

                        {job.freelancer && job.freelancer._id === selectedApplicant.freelancer._id ? (
                          <Button
                            onClick={handleMessageApplicant}
                            isLoading={messageMutation.isPending}
                            disabled={messageMutation.isPending}
                            variant="outline"
                            className="flex items-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* Application details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Application Details
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            Applied on{" "}
                            {format(
                              new Date(selectedApplicant.appliedAt),
                              "MMMM d, yyyy 'at' h:mm a",
                            )}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          This freelancer applied to your job posting. You can
                          view their profile details below to determine if
                          they're a good fit for your project.
                        </p>
                      </div>
                    </div>

                    {/* Freelancer profile */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Freelancer Profile
                      </h3>

                      {/* Bio */}
                      {selectedApplicant.freelancer?.bio && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            About
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedApplicant.freelancer.bio}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {selectedApplicant.freelancer?.skills &&
                        selectedApplicant.freelancer.skills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedApplicant.freelancer.skills.map(
                                (skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Stats */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="flex items-center">
                              <Award className="h-5 w-5 text-orange-500 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Jobs Completed
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {selectedApplicant.freelancer
                                    ?.completedJobs || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 text-yellow-500 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Average Rating
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {selectedApplicant.freelancer?.averageRating >
                                  0
                                    ? selectedApplicant.freelancer.averageRating.toFixed(
                                        1,
                                      )
                                    : "No ratings yet"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reviews */}
                      {selectedApplicant.freelancer?.ratings &&
                        selectedApplicant.freelancer.ratings.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              Recent Reviews (
                              {selectedApplicant.freelancer.ratings.length})
                            </h4>
                            <div className="space-y-3">
                              {selectedApplicant.freelancer.ratings
                                .slice(0, 3)
                                .map((review, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center">
                                        <div className="flex mr-2">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-4 w-4 ${
                                                i < review.rating
                                                  ? "text-yellow-400"
                                                  : "text-gray-300 dark:text-gray-600"
                                              }`}
                                              fill={
                                                i < review.rating
                                                  ? "currentColor"
                                                  : "none"
                                              }
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {review.rating}/5
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(
                                          new Date(review.createdAt),
                                          "MMM d, yyyy",
                                        )}
                                      </span>
                                    </div>

                                    {review.from?.name && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        By {review.from.name}
                                      </p>
                                    )}

                                    {review.review && (
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        "{review.review}"
                                      </p>
                                    )}
                                  </div>
                                ))}

                              {selectedApplicant.freelancer.ratings.length >
                                3 && (
                                <div className="text-center">
                                  <Link
                                    to={`/profile/${selectedApplicant.freelancer._id}`}
                                    className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm"
                                  >
                                    View all{" "}
                                    {
                                      selectedApplicant.freelancer.ratings
                                        .length
                                    }{" "}
                                    reviews
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Member since */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Member Information
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              Member since{" "}
                              {format(
                                new Date(
                                  selectedApplicant.freelancer?.createdAt ||
                                    Date.now(),
                                ),
                                "MMMM yyyy",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* View full profile button */}
                      <div className="mt-6">
                        <Link
                          to={`/profile/${selectedApplicant.freelancer._id}`}
                        >
                          <Button
                            variant="outline"
                            className="w-full border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200"
                          >
                            View Full Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select an applicant
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      Click on an applicant from the list to view their profile
                      information and make a hiring decision.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicantReviewPage;
