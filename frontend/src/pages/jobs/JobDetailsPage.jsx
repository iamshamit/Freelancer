// src/pages/jobs/JobDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  MapPin,
  Clock3,
  Award,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "../../components/layout/DashboardLayout";
import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import Button from "../../components/common/Button";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import api from "../../services/api";

const JobDetailPage = ({ darkMode, toggleDarkMode }) => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  const [domainName, setDomainName] = useState("");

  // Fetch job details
  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.job.getById(id),
  });

  // Fetch domain details if needed
  const { data: domainData } = useQuery({
    queryKey: ["domain", job?.domain],
    queryFn: () => api.domains.getById(job.domain),
    enabled: !!job && typeof job.domain === "string",
  });

  // Set domain name when data is available
  useEffect(() => {
    if (job) {
      if (typeof job.domain === "object" && job.domain?.name) {
        setDomainName(job.domain.name);
      } else if (domainData?.name) {
        setDomainName(domainData.name);
      } else {
        setDomainName("General");
      }
    }
  }, [job, domainData]);

  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: () => api.job.apply(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["job", id]);
      setShowApplySuccess(true);
      setTimeout(() => setShowApplySuccess(false), 3000);
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SkeletonLoader type="card" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Error Loading Job"
            description={
              error.message || "There was an error loading this job."
            }
            icon={<AlertCircle className="h-12 w-12" />}
            actionText="Go Back"
            actionLink="/jobs"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <EmptyState
            title="Job Not Found"
            description="The job you're looking for doesn't exist or has been removed."
            icon={<Briefcase className="h-12 w-12" />}
            actionText="Browse Jobs"
            actionLink="/jobs"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back navigation - Moved to the top */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Jobs</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success message */}
          {showApplySuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-lg flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                Application submitted successfully! The employer will review
                your profile and get in touch if interested.
              </span>
            </motion.div>
          )}

          {/* Job header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {job.title}
                </h1>
                <JobStatusBadge status={job.status} />
              </div>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span>
                    $
                    {typeof job.budget === "number"
                      ? job.budget.toFixed(2)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>
                    Posted on {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Briefcase className="h-5 w-5 mr-1" />
                  <span>{domainName}</span>
                </div>
              </div>

              {/* Employer info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-medium mb-3">
                  Posted by
                </h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                    {job.employer?.profilePicture ? (
                      <img
                        src={job.employer.profilePicture}
                        alt={job.employer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-lg">
                      {job.employer?.name || "Anonymous Employer"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.employer?.jobCount || 0} jobs posted
                      </p>
                      {job.employer?.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.employer.location}
                        </p>
                      )}
                      {job.employer?.memberSince && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock3 className="h-4 w-4 mr-1" />
                          Member since{" "}
                          {format(
                            new Date(job.employer.memberSince),
                            "MMM yyyy"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply button */}
              {job.status === "open" && (
                <div className="mb-6">
                  <Button
                    onClick={() => applyMutation.mutate()}
                    isLoading={applyMutation.isPending}
                    disabled={job.hasApplied || applyMutation.isPending}
                    className="w-full md:w-auto"
                    size="lg"
                  >
                    {job.hasApplied ? "Already Applied" : "Apply Now"}
                  </Button>
                  {job.hasApplied && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You have already applied to this job. The employer will
                      contact you if interested.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              {/* Job description */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                    Job Description
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-orange-500" />
                      Requirements
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                      {job.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Job details sidebar */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-24">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Job Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Budget
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        $
                        {typeof job.budget === "number"
                          ? job.budget.toFixed(2)
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Category
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {domainName}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Posted
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {format(new Date(job.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>

                    {job.estimatedDuration && (
                      <div>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Estimated Duration
                        </h3>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {job.estimatedDuration}
                        </p>
                      </div>
                    )}

                    {job.experienceLevel && (
                      <div>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Experience Level
                        </h3>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {job.experienceLevel}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Status
                      </h3>
                      <JobStatusBadge status={job.status} />
                    </div>

                    {Array.isArray(job.applicants) && (
                      <div>
                        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Applications
                        </h3>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {job.applicants.length} applicant
                          {job.applicants.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetailPage;
