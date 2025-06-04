// src/components/milestones/MilestoneTimeline.jsx
import { motion } from 'framer-motion';
import { Check, Clock, DollarSign } from 'lucide-react';
import MilestoneStatusBadge from './MilestoneStatusBadge';

const MilestoneTimeline = ({ milestones }) => {
  const getIcon = (status) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'completed':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getIconBg = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-orange-500';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />

      {/* Timeline Items */}
      <div className="space-y-8">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-4"
          >
            {/* Icon */}
            <div
              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white ${getIconBg(
                milestone.status
              )}`}
            >
              {getIcon(milestone.status)}
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-white">{milestone.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                </div>
                <MilestoneStatusBadge status={milestone.status} size="small" />
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-gray-500">
                  {milestone.percentage}% • ${milestone.amount}
                </span>
                {milestone.completedAt && (
                  <span className="text-gray-500">
                    Completed {new Date(milestone.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;