// src/components/common/Badge.jsx
import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  // Define variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'pink':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default Badge;