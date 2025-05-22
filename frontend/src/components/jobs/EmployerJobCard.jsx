// src/components/jobs/EmployerJobCard.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Users, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Badge from '../common/Badge';
import JobStatusBadge from './JobStatusBadge';

const EmployerJobCard = ({ job }) => {
  // Handle case where job is undefined
  if (!job || typeof job !== 'object') {
    return null;
  }

  // Destructure with default values
  const {
    _id = '',
    title = 'Untitled Job',
    domain = 'General',
    budget = 0,
    createdAt = new Date(),
    applicants = [],
    status = 'open',
    newApplicants = 0
  } = job;

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
        <JobStatusBadge status={status} />
        {newApplicants > 0 && (
          <Badge variant="danger" className="animate-pulse">
            {newApplicants} new {newApplicants === 1 ? 'applicant' : 'applicants'}
          </Badge>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {title}
      </h3>
      
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Posted {formattedDate()} ago</span>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>${typeof budget === 'number' ? budget.toFixed(2) : '0.00'}</span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4 mr-1" />
                    <span>{applicantsCount} {applicantsCount === 1 ? 'applicant' : 'applicants'}</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 flex flex-wrap gap-2">
        <Link 
          to={`/job/${_id}`}
          className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium flex-grow"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Link>
        
        <Link 
          to={`/employer/jobs/${_id}/applicants`}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium flex-grow"
        >
          <Users className="h-4 w-4 mr-2" />
          View Applicants
        </Link>
      </div>
    </motion.div>
  );
};

export default EmployerJobCard;