// src/components/common/EmptyState.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import React from 'react';

const EmptyState = ({ 
  title, 
  description, 
  icon, 
  actionText, 
  actionLink, 
  onAction,
  className = ''
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center ${className}`}
    >
      {icon && React.isValidElement(icon) && (
        <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {(actionText && actionLink) && (
        <Link 
          to={actionLink}
          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
        >
          {actionText}
        </Link>
      )}
      
      {(actionText && onAction) && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg transition-colors font-medium"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;