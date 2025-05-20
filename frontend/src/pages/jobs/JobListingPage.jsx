// src/pages/jobs/JobListingPage.jsx
import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, AlertCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import JobCard from "../../components/jobs/JobCard";
import JobFilterBar from "../../components/jobs/JobFilterBar";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import api from "../../services/api";

const JobListingPage = ({ darkMode, toggleDarkMode }) => {
  const [filters, setFilters] = useState({});
  const observer = useRef();

  // Fetch jobs with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["jobs", filters],
    queryFn: ({ pageParam = 1 }) =>
      api.job.getAll({ page: pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });

  // Setup intersection observer for infinite scroll
  const lastJobElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Safely extract jobs from data
  const getJobs = () => {
    if (!data || !data.pages) return [];

    return data.pages.flatMap((page) => {
      if (!Array.isArray(page.jobs)) return [];
      return page.jobs;
    });
  };

  const jobs = getJobs();
  const hasJobs = jobs.length > 0;

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Available Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Browse and find the perfect job for your skills
          </p>

          {/* Filters */}
          <JobFilterBar onFilterChange={handleFilterChange} />

          {/* Job listings */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Error Loading Jobs"
              description={error.message || "There was an error loading jobs."}
              icon={<AlertCircle className="h-12 w-12" />}
              actionText="Try Again"
              onAction={() => refetch()}
            />
          ) : hasJobs ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => {
                  // Skip rendering if job is invalid
                  if (!job || !job._id) return null;

                  // Add ref to last element for infinite scrolling
                  if (jobs.length === index + 1) {
                    return (
                      <div ref={lastJobElementRef} key={job._id}>
                        <JobCard job={job} />
                      </div>
                    );
                  } else {
                    return <JobCard key={job._id} job={job} />;
                  }
                })}
              </div>

              {/* Loading indicator for next page */}
              {isFetchingNextPage && (
                <div className="mt-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No Jobs Found"
              description="No jobs match your search criteria. Try adjusting your filters or check back later for new opportunities."
              icon={<Briefcase className="h-12 w-12" />}
              actionText="Reset Filters"
              onAction={() => setFilters({})}
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JobListingPage;
