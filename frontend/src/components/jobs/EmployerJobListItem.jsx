// src/components/jobs/EmployerJobListItem.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Users, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import JobStatusBadge from './JobStatusBadge';
import Badge from '../common/Badge';

const EmployerJobListItem = ({ job }) => {
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
    description = '',
    createdAt = new Date(),
    applicants = [],
    status = 'open',
    newApplicants = 0
  } = job;

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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <JobStatusBadge status={status} />
            {newApplicants > 0 && (
              <Badge variant="danger" className="animate-pulse">
                {newApplicants} new {newApplicants === 1 ? 'applicant' : 'applicants'}
              </Badge>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              Posted on {formattedDate()}
            </span>
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
            
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 mr-1" />
              <span>{applicantsCount} {applicantsCount === 1 ? 'applicant' : 'applicants'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex gap-2">
          <Link 
            to={`/job/${_id}`}
            className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Link>
          
          <Link 
            to={`/employer/jobs/${_id}/applicants`}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            <Users className="h-4 w-4 mr-2" />
            Applicants
          </Link>
          
          {status === 'draft' && (
            <>
              <Link 
                to={`/employer/jobs/${_id}/edit`}
                className="flex items-center justify-center p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                aria-label="Edit job"
              >
                <Edit className="h-4 w-4" />
              </Link>
              
              <button
                className="flex items-center justify-center p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                aria-label="Delete job"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployerJobListItem;