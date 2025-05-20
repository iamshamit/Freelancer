// src/components/profile/ReviewList.jsx
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Calendar } from 'lucide-react';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';
import api from '../../services/api';

const ReviewList = ({ profileId, isOwnProfile }) => {
  // Fetch reviews
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews', profileId],
    queryFn: () => api.user.getUserReviews(profileId),
  });
  
  if (isLoading) {
    return <SkeletonLoader type="list" count={3} />;
  }
  
  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
        Error loading reviews: {error.message}
      </div>
    );
  }
  
  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        title="No reviews yet"
        description={isOwnProfile ? "You haven't received any reviews yet." : "This user hasn't received any reviews yet."}
        icon={<Star className="h-12 w-12" />}
      />
    );
  }
  
  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  return (
    <div>
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0 md:mr-8">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mr-4">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.round(averageRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = (count / reviews.length) * 100;
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center mr-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start">
              <img
                src={review.reviewer.profilePicture || "/default-avatar.png"}
                alt={review.reviewer.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {review.reviewer.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        for {review.jobTitle}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-3 text-gray-700 dark:text-gray-300">
                  {review.comment}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;