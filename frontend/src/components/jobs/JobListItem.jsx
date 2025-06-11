import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Calendar, Users, Clock, User, Sparkles } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Badge from '../common/Badge';

const JobListItem = ({ job, isEmployer = false, showRecommendedBadge = false }) => {
  // Handle case where job is undefined or missing properties
  if (!job || typeof job !== 'object') {
    return null;
  }

  // Destructure with default values to prevent errors
  const {
    _id = '',
    title = 'Untitled Job',
    domain = { name: 'General', color: 'default' },
    budget = 0,
    description = '',
    createdAt = new Date(),
    applicants = [],
    status = 'open',
    employer = {}
  } = job;

  // Ensure domain is an object
  const domainObj = typeof domain === 'object' ? domain : { name: domain || 'General', color: 'default' };

  // Format date safely
  const formattedDate = () => {
    try {
      return format(new Date(createdAt), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Get applicant count
  const applicantsCount = Array.isArray(applicants) ? applicants.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 dark:border-gray-700 mb-4"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-2">
            {showRecommendedBadge && (
              <Badge variant="orange" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recommended
              </Badge>
            )}
            <Badge variant={domainObj.color || "primary"} className="flex items-center gap-1">
              {domainObj.name}
            </Badge>
            {status && (
              <Badge variant={
                status === 'open' ? 'success' :
                status === 'in_progress' ? 'primary' :
                status === 'completed' ? 'info' :
                'default'
              }>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </Badge>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${typeof budget === 'number' ? budget.toFixed(2) : '0.00'}</span>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Posted {formattedDate()}</span>
            </div>
            
            {!isEmployer && employer && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4 mr-1" />
                <span>{employer.name || 'Anonymous Employer'}</span>
              </div>
            )}
            
            {isEmployer && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Users className="h-4 w-4 mr-1" />
                <span>{applicantsCount} applicant{applicantsCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 self-end md:self-center">
          <Link 
            to={isEmployer ? `/employer/jobs/${_id}` : `/job/${_id}`}
            className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default JobListItem;