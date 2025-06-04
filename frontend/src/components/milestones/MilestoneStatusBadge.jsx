// src/components/milestones/MilestoneStatusBadge.jsx
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react';

const MilestoneStatusBadge = ({ status, size = 'default' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-gray-700 text-gray-300 border-gray-600',
    },
    in_progress: {
      label: 'In Progress',
      icon: AlertCircle,
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-green-500/20 text-green-400 border-green-500/50',
    },
    approved: {
      label: 'Approved',
      icon: DollarSign,
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-500/20 text-red-400 border-red-500/50',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.className} ${sizeClasses[size]} font-medium`}
    >
      <Icon className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </motion.div>
  );
};

export default MilestoneStatusBadge;