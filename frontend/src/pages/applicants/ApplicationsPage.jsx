// src/pages/applications/ApplicationsPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  AlertCircle,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Search,
  ChevronRight,
  User,
  MessageSquare,
  Target,
  Award, // Added for completed status
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import api from "../../services/api";

const ApplicationsPage = ({ darkMode, toggleDarkMode }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch applications
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.job.getAppliedJobs(),
  });

  // Message employer mutation
  const messageMutation = useMutation({
    mutationFn: (jobId) => api.chat.create(jobId),
    onSuccess: (data) => {
      navigate(`/chat/${data?._id || ""}`);
    },
    onError: (error) => {
      console.error("Failed to create chat:", error);
      // You could add a toast notification here
    },
  });

  // Filter applications based on status and search query
  const getFilteredApplications = () => {
    if (!applications || !Array.isArray(applications)) return [];
  
    return applications.filter((app) => {
      // Skip invalid applications
      if (!app) return false;
  
      // Filter by status
      if (activeFilter === "completed") {
        // Show only completed jobs
        if (app.status !== "completed") return false;
      } else {
        // For all other filters (including "all") - exclude completed jobs
        if (app.status === "completed") return false;
        
        // Then filter by application status for specific filters
        if (activeFilter !== "all" && app.applicationStatus !== activeFilter) {
          return false;
        }
      }
  
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = app.title?.toLowerCase() || "";
        const employerName = app.employer?.name?.toLowerCase() || "";
  
        return title.includes(query) || employerName.includes(query);
      }
  
      return true;
    });
  };
  
  const filteredApplications = getFilteredApplications();

  // Get status badge variant and icon
  const getStatusInfo = (application) => {
    // Check if the job is completed first
    if (application.status === "completed") {
      return {
        variant: "success",
        icon: <Award className="h-4 w-4 mr-1" />,
        text: "Completed",
      };
    }

    // Otherwise, use application status
    switch (application.applicationStatus) {
      case "accepted":
        return {
          variant: "success",
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          text: "Accepted",
        };
      case "rejected":
        return {
          variant: "danger",
          icon: <XCircle className="h-4 w-4 mr-1" />,
          text: "Rejected",
        };
      case "pending":
      default:
        return {
          variant: "warning",
          icon: <Clock className="h-4 w-4 mr-1" />,
          text: "Pending",
        };
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle message employer
  const handleMessageEmployer = (jobId) => {
    messageMutation.mutate(jobId);
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="mb-4">
          <SkeletonLoader type="card" height="150px" />
        </div>
      ));
  };

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Applications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and manage your job applications
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link to="/jobs">
                <Button className="flex items-center bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
            <div className="p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search input */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Filter label */}
                <div className="flex items-center text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  <Filter className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">Filter by status:</span>
                </div>
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    activeFilter === "all"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  All Applications
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    activeFilter === "pending"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveFilter("accepted")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    activeFilter === "accepted"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    activeFilter === "completed"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveFilter("rejected")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    activeFilter === "rejected"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {/* Applications list */}
          {isLoading ? (
            <div className="space-y-4">{renderSkeletons()}</div>
          ) : error ? (
            <EmptyState
              title="Error Loading Applications"
              description={
                error.message || "There was an error loading your applications."
              }
              icon={<AlertCircle className="h-12 w-12" />}
              actionText="Try Again"
              onAction={() => refetch()}
            />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title={
                searchQuery || activeFilter !== "all"
                  ? "No Matching Applications"
                  : "No Applications Yet"
              }
              description={
                searchQuery || activeFilter !== "all"
                  ? "No applications match your current filters. Try adjusting your search or filter criteria."
                  : "You haven't applied to any jobs yet. Browse available jobs to get started."
              }
              icon={<Briefcase className="h-12 w-12" />}
              actionText={
                searchQuery || activeFilter !== "all"
                  ? "Clear Filters"
                  : "Browse Jobs"
              }
              actionLink={
                searchQuery || activeFilter !== "all" ? null : "/jobs"
              }
              onAction={
                searchQuery || activeFilter !== "all"
                  ? () => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }
                  : null
              }
            />
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Showing {filteredApplications.length} application
                {filteredApplications.length !== 1 ? "s" : ""}
              </p>

              <AnimatePresence>
                {filteredApplications.map((application, index) => {
                  // Skip invalid applications
                  if (!application) return null;

                  const { variant, icon, text } = getStatusInfo(application);
                  const appliedAt = application.applicants?.[0]?.appliedAt;
                  const completedAt = application.completedAt;
                  const isCompleted = application.status === "completed";

                  return (
                    <motion.div
                      key={application._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="p-5">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                          <div>
                            <Link
                              to={`/job/${application._id}`}
                              className="text-xl font-bold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                            >
                              {application.title || "Untitled Job"}
                            </Link>
                            <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                              {application.employer && (
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  <span>
                                    {application.employer.name ||
                                      "Anonymous Employer"}
                                  </span>
                                </div>
                              )}
                              {application.domain && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>
                                    {application.domain.name || "General"}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <Badge
                            variant={variant}
                            className="flex items-center shadow-sm"
                          >
                            {icon}
                            <span>{text}</span>
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4">
                          {application.budget !== undefined && (
                            <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>
                                $
                                {typeof application.budget === "number"
                                  ? application.budget.toFixed(2)
                                  : application.budget}
                              </span>
                            </div>
                          )}

                          {appliedAt && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                Applied{" "}
                                {formatDistanceToNow(new Date(appliedAt))} ago
                              </span>
                            </div>
                          )}

                          {isCompleted && completedAt && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Award className="h-4 w-4 mr-1" />
                              <span>
                                Completed{" "}
                                {formatDistanceToNow(new Date(completedAt))} ago
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 line-clamp-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {application.description}
                        </div>

                        <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                          {isCompleted ? (
                            // Show different actions for completed jobs
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/job/${application._id}/milestones`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 hover:border-green-500 transition-all duration-200 transform hover:scale-105"
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  View Milestones
                                </Button>
                              </Link>
                              
                              {!application.isRatedByEmployer && (
                                <Link to={`/rate-employer/${application._id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200 transform hover:scale-105"
                                  >
                                    <Award className="h-4 w-4 mr-2" />
                                    Rate Employer
                                  </Button>
                                </Link>
                              )}
                            </div>
                          ) : application.applicationStatus === "accepted" ? (
                            // Show actions for accepted (but not completed) jobs
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() =>
                                  handleMessageEmployer(application._id)
                                }
                                isLoading={messageMutation.isPending}
                                disabled={messageMutation.isPending}
                                variant="outline"
                                size="sm"
                                className="flex items-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200 transform hover:scale-105"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message Employer
                              </Button>
                              
                              <Link to={`/job/${application._id}/milestones`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center border-orange-500/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-200 transform hover:scale-105"
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  Milestones
                                </Button>
                              </Link>
                            </div>
                          ) : null}

                          <Link
                            to={`/job/${application._id}`}
                            className="ml-auto flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
                          >
                            View Job Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;