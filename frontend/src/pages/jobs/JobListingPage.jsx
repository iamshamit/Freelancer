// src/pages/jobs/JobListingPage.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, AlertCircle, ArrowUpDown, IndianRupee } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import JobCard from "../../components/jobs/JobCard";
import JobListItem from "../../components/jobs/JobListItem";
import ViewToggle from "../../components/common/ViewToggle";
import JobFilterBar from "../../components/jobs/JobFilterBar";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import EmptyState from "../../components/common/EmptyState";
import api from "../../services/api";

const JobListingPage = ({ darkMode, toggleDarkMode }) => {
  const [filters, setFilters] = useState({});
  const [view, setView] = useState(() => {
    // Get saved view preference from localStorage or default to 'grid'
    return localStorage.getItem("jobViewPreference") || "grid";
  });
  const [sortBy, setSortBy] = useState("newest");
  const observer = useRef();

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem("jobViewPreference", view);
  }, [view]);

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
    queryKey: ["jobs", filters, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      api.job.getAll({ page: pageParam, ...filters, sortBy }),
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
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
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

  // View toggle component
  const viewToggleComponent = <ViewToggle view={view} onViewChange={setView} />;

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Available Jobs
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse and find the perfect job for your skills
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="appearance-none pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget_high">Highest Budget</option>
                  <option value="budget_low">Lowest Budget</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ArrowUpDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <JobFilterBar
            onFilterChange={handleFilterChange}
            viewToggle={viewToggleComponent}
          />

          {/* Job listings */}
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
              description={error.message || "There was an error loading jobs."}
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
                  {jobs.map((job, index) => {
                    // Skip rendering if job is invalid
                    if (!job || !job._id) return null;

                    // Add ref to last element for infinite scrolling
                    if (jobs.length === index + 1) {
                      return (
                        <div ref={lastJobElementRef} key={job._id}>
                          <JobListItem job={job} />
                        </div>
                      );
                    } else {
                      return <JobListItem key={job._id} job={job} />;
                    }
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <EmptyState
              title="No Jobs Found"
              description="No jobs match your search criteria. Try adjusting your filters or check back later for new opportunities."
              icon={<Briefcase className="h-12 w-12" />}
              actionText="Reset Filters"
              onAction={() => setFilters({})}
            />
          )}

          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <div className="mt-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JobListingPage;
