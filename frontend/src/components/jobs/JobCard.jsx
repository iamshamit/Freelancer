// src/components/jobs/JobCard.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Calendar, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Badge from '../common/Badge';

const JobCard = ({ job, isEmployer = false }) => {
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
    status = 'open'
  } = job;

  // Ensure domain is an object
  const domainObj = typeof domain === 'object' ? domain : { name: domain || 'General', color: 'default' };

  // Format date safely
  const formattedDate = () => {
    try {
      return formatDistanceToNow(new Date(createdAt));
    } catch (error) {
      return 'recently';
    }
  };

  // Get applicant count
  const applicantsCount = Array.isArray(applicants) ? applicants.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <Badge variant={domainObj.color || "primary"} className="flex items-center gap-1">
          {domainObj.icon && <span className="material-icons text-sm">{domainObj.icon}</span>}
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
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
        {description}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>${typeof budget === 'number' ? budget.toFixed(2) : '0.00'}</span>
        </div>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Posted {formattedDate()} ago</span>
        </div>
      </div>
      
      {isEmployer ? (
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-400 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{applicantsCount} applicant{applicantsCount !== 1 ? 's' : ''}</span>
          </div>
          <Link 
            to={`/employer/jobs/${_id}`}
            className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
          >
            View Details
          </Link>
        </div>
      ) : (
        <Link 
          to={`/job/${_id}`}
          className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
        >
          View Job
        </Link>
      )}
    </motion.div>
  );
};

export default JobCard;