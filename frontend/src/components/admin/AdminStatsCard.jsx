// src/components/admin/AdminStatsCard.jsx
import { motion } from 'framer-motion';

const AdminStatsCard = ({ title, value, subtitle, icon: Icon, color = 'orange', className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <span className={`p-2 rounded-full ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
          color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
          color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
          color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon className={`h-5 w-5 ${
            color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
            color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
            color === 'red' ? 'text-red-600 dark:text-red-400' :
            'text-gray-600 dark:text-gray-400'
          }`} />
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default AdminStatsCard;