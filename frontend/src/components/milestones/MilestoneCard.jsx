// src/components/milestones/MilestoneCard.jsx
import { motion } from 'framer-motion';
import { Calendar, DollarSign, FileText, ChevronRight } from 'lucide-react';
import MilestoneStatusBadge from './MilestoneStatusBadge';
import Button from '../common/Button';

const MilestoneCard = ({ 
  milestone, 
  onApprove, 
  onRequestApproval, 
  onView,
  isEmployer,
  index = 0 
}) => {
  const { title, description, percentage, amount, status, dueDate } = milestone;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
        </div>
        <MilestoneStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-700 rounded-lg">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Progress</p>
            <p className="text-sm font-medium text-white">{percentage}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-700 rounded-lg">
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-medium text-white">${amount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-700 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className="text-sm font-medium text-white">
              {new Date(dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === 'completed' && isEmployer && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(milestone._id)}
            className="flex-1"
          >
            Approve & Release Payment
          </Button>
        )}
        
        {status === 'in_progress' && !isEmployer && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onRequestApproval(milestone._id)}
            className="flex-1"
          >
            Request Approval
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(milestone._id)}
          className="flex items-center gap-1"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default MilestoneCard;