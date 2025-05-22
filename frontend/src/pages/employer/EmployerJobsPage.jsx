import { useState, useEffect } from "react";
import {Link} from 'react-router-dom'
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmployerJobCard from "../../components/jobs/EmployerJobCard";
import EmployerJobListItem from "../../components/jobs/EmployerJobListItem";
import ViewToggle from "../../components/common/ViewToggle";
import EmployerJobFilterBar from "../../components/jobs/EmployerJobFilterBar";
import Button from "../../components/common/Button";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import api from "../../services/api";

const EmployerJobsPage = ({ darkMode, toggleDarkMode }) => {
  const [view, setView] = useState(() => {
    return localStorage.getItem("employerJobViewPreference") || "grid";
  });
  const [filters, setFilters] = useState({});

  useEffect(() => {
    localStorage.setItem("employerJobViewPreference", view);
  }, [view]);

  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: () => api.job.getEmployerJobs().then((res) => res.data),
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  const jobs = (jobsData || []).filter((job) => {
  const matchesSearch =
    !filters.search ||
    job.title.toLowerCase().includes(filters.search.toLowerCase());
  const matchesStatus = !filters.status || job.status === filters.status;
  return matchesSearch && matchesStatus;
});
  const hasJobs = jobs.length > 0;

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Jobs
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your posted jobs and review applicants
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/employer/post-job" className="flex items-center">
              <Button as="link" to="/employer/jobs/new" className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Post New Job
              </Button>
              </Link>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <EmployerJobFilterBar onFilterChange={handleFilterChange} />
            <div className="mt-4 sm:mt-0">
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>

          {/* Job Listings */}
          {isLoading ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} type="list-item" />
                ))}
              </div>
            )
          ) : error ? (
            <EmptyState
              title="Error Loading Jobs"
              description={error.message || "There was an error loading your jobs."}
              icon={<AlertCircle className="h-12 w-12" />}
              actionText="Try Again"
              onAction={() => refetch()}
            />
          ) : hasJobs ? (
            <AnimatePresence mode="wait">
              {view === "grid" ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {jobs.map((job) => (
                    <EmployerJobCard key={job._id} job={job} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {jobs.map((job) => (
                    <EmployerJobListItem key={job._id} job={job} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <EmptyState
              title="No Jobs Found"
              description={
                Object.keys(filters).length > 0
                  ? "No jobs match your filters. Try adjusting your search criteria."
                  : "You haven't posted any jobs yet. Create your first job to get started."
              }
              icon={<Briefcase className="h-12 w-12" />}
              actionText={Object.keys(filters).length > 0 ? "Clear Filters" : "Post a Job"}
              actionLink={Object.keys(filters).length > 0 ? null : "/employer/jobs/new"}
              onAction={Object.keys(filters).length > 0 ? () => setFilters({}) : null}
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerJobsPage;