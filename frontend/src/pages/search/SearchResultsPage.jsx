import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Briefcase, User, Star, Save, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import JobCard from '../../components/jobs/JobCard';
import FreelancerCard from '../../components/search/FreelancerCard';
import SearchFilters from '../../components/search/SearchFilters';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const SearchResultsPage = ({ darkMode, toggleDarkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  // Search query
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, activeTab, filters],
    queryFn: () => api.search.global({ 
      query, 
      type: activeTab,
      ...filters 
    }),
    enabled: query.length > 0
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: (searchData) => api.search.saveSearch(searchData),
    onSuccess: () => {
      // Show success toast
    }
  });

  // Handle save search
  const handleSaveSearch = () => {
    saveSearchMutation.mutate({
      query,
      filters,
      type: activeTab
    });
  };

  // Calculate result counts
  const jobCount = data?.jobs?.length || 0;
  const freelancerCount = data?.freelancers?.length || 0;
  const totalCount = data?.totalResults || 0;

  if (!query) {
    navigate('/');
    return null;
  }

  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {totalCount} results found for "{query}"
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={saveSearchMutation.isLoading}
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Search
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              All Results
              {activeTab === 'all' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'jobs'
                  ? 'text-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Jobs ({jobCount})
              </div>
              {activeTab === 'jobs' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('freelancers')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'freelancers'
                  ? 'text-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Freelancers ({freelancerCount})
              </div>
              {activeTab === 'freelancers' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                />
              )}
            </button>
          </div>
        </motion.div>

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
                <SearchFilters
                  activeTab={activeTab}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
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
                title="Error loading results"
                description="There was an error loading search results. Please try again."
                icon={<X className="h-12 w-12" />}
              />
            ) : totalCount === 0 ? (
              <EmptyState
                title="No results found"
                description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
                icon={<Search className="h-12 w-12" />}
              />
            ) : (
              <div className="space-y-8">
                {/* Jobs section */}
                {(activeTab === 'all' || activeTab === 'jobs') && jobCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {activeTab === 'all' && (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Jobs
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.jobs.map((job) => (
                        <JobCard key={job._id} job={job} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Freelancers section */}
                {(activeTab === 'all' || activeTab === 'freelancers') && freelancerCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {activeTab === 'all' && (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Freelancers
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.freelancers.map((freelancer) => (
                        <FreelancerCard key={freelancer._id} freelancer={freelancer} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchResultsPage;