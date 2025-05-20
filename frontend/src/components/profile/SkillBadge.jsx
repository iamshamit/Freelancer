// src/components/profile/SkillBadge.jsx
import { motion } from 'framer-motion';

const SkillBadge = ({ name, level, className = '' }) => {
  // Map skill level to color and label
  const getLevelInfo = (level) => {
    switch (level) {
      case 'beginner':
        return { 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          label: 'Beginner' 
        };
      case 'intermediate':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          label: 'Intermediate' 
        };
      case 'advanced':
        return { 
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
          label: 'Advanced' 
        };
      case 'expert':
        return { 
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
          label: 'Expert' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          label: '' 
        };
    }
  };
  
    const { color, label } = level ? getLevelInfo(level) : { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: '' };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-3 py-1.5 rounded-full ${color} ${className}`}
    >
      <span className="font-medium">{name}</span>
      {level && label && (
        <span className="ml-2 text-xs opacity-80">• {label}</span>
      )}
    </motion.div>
  );
};

export default SkillBadge;