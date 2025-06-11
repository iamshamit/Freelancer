import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Briefcase, MapPin, Clock, CheckCircle } from 'lucide-react';
import SkillBadge from '../profile/SkillBadge';

const FreelancerCard = ({ freelancer }) => {
  const { 
    _id, 
    name, 
    profilePicture, 
    bio, 
    skills, 
    averageRating, 
    completedJobs,
    ratings = []
  } = freelancer;

  // Get recent review
  const recentReview = ratings[0];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
    >
      <Link to={`/profile/${_id}`} className="block">
        {/* Header */}
        <div className="relative p-6 pb-4">
          {/* Profile picture */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={profilePicture || '/default-avatar.png'}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
              {completedJobs > 10 && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {name}
              </h3>
              
              {/* Rating and jobs */}
              <div className="flex items-center gap-4 mt-1">
                {averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({ratings.length})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{completedJobs} jobs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {bio}
            </p>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Recent review */}
        {recentReview && (
          <div className="px-6 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                  "{recentReview.review}"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  - {recentReview.from?.name || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="px-6 pb-6">
          <button className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
            View Profile
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default FreelancerCard;