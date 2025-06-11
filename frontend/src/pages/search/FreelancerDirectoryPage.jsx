import { useState, useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FreelancerCard from '../../components/search/FreelancerCard';
import SearchFilters from '../../components/search/SearchFilters';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const FreelancerDirectoryPage = ({ darkMode, toggleDarkMode }) => {
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const observer = useRef();

  // Fetch freelancers with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['freelancers', filters, sortBy, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      api.search.freelancers({ 
        page: pageParam, 
        ...filters, 
        sortBy,
        search: searchQuery 
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  // Setup intersection observer for infinite scroll
  const lastFreelancerElementRef = useCallback(
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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the state change
  };

  // Get freelancers from pages
  const freelancers = data?.pages?.flatMap(page => page.freelancers) || [];

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Find Freelancers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with talented professionals for your projects
            </p>
          </div>

          {/* Search and filters bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, skills, or bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </form>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
              >
                <option value="rating">Highest Rated</option>
                <option value="jobs">Most Jobs Completed</option>
                <option value="newest">Recently Joined</option>
              </select>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-80"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Filters
                      </h3>
                      <button
                        onClick={() => setFilters({})}
                        className="text-sm text-orange-500 hover:text-orange-600"
                      >
                        Clear all
                      </button>
                    </div>
                    <SearchFilters
                      activeTab="freelancers"
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonLoader key={i} type="card" />
                  ))}
                </div>
              ) : error ? (
                <EmptyState
                  title="Error Loading Freelancers"
                  description="There was an error loading freelancers. Please try again."
                  icon={<X className="h-12 w-12" />}
                  actionText="Try Again"
                  onAction={() => refetch()}
                />
              ) : freelancers.length === 0 ? (
                <EmptyState
                  title="No Freelancers Found"
                  description="No freelancers match your search criteria. Try adjusting your filters."
                  icon={<Users className="h-12 w-12" />}
                  actionText="Clear Filters"
                  onAction={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freelancers.map((freelancer, index) => {
                    if (freelancers.length === index + 1) {
                      return (
                        <div ref={lastFreelancerElementRef} key={freelancer._id}>
                          <FreelancerCard freelancer={freelancer} />
                        </div>
                      );
                    } else {
                      return <FreelancerCard key={freelancer._id} freelancer={freelancer} />;
                    }
                  })}
                </div>
              )}

              {/* Loading indicator for next page */}
              {isFetchingNextPage && (
                <div className="mt-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerDirectoryPage;