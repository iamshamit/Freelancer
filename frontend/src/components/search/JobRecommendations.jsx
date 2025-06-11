import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from '../jobs/JobCard';
import SkeletonLoader from '../common/SkeletonLoader';
import api from '../../services/api';

const JobRecommendations = ({ limit = 3 }) => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['jobRecommendations'],
    queryFn: api.job.getRecommended,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recommended for You
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.jobs || recommendations.jobs.length === 0) {
    return null;
  }

  const jobs = recommendations.jobs.slice(0, limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recommended for You
          </h2>
        </div>
        {recommendations.length > limit && (
          <Link
            to="/jobs?filter=recommended"
            className="flex items-center text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <motion.div
            key={job._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <JobCard job={job} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default JobRecommendations;