// src/components/profile/ReviewCard.jsx
import { motion } from 'framer-motion';
import { Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ReviewCard = ({ review, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start">
        <img
          src={review.reviewer?.profilePicture || "/default-avatar.png"}
          alt={review.reviewer?.name || "Reviewer"}
          className="w-12 h-12 rounded-full object-cover mr-4 flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {review.reviewer?.name || "Anonymous"}
              </h3>
              <div className="flex items-center mt-1">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {review.jobTitle && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    for {review.jobTitle}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : 'Unknown date'}
            </div>
          </div>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            {review.comment || "No comment provided."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
