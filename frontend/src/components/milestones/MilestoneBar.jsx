// src/components/milestones/MilestoneBar.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MilestoneBar = ({ percentage = 0, showMarkers = true, height = 'default' }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const heightClasses = {
    small: 'h-2',
    default: 'h-3',
    large: 'h-4',
  };

  const milestoneMarkers = [25, 50, 75, 100];

  return (
    <div className="relative w-full">
      {/* Progress Bar Container */}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${animatedPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 relative"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      {/* Percentage Label */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-400">Progress</span>
        <motion.span 
          className="text-sm font-medium text-orange-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Milestone Markers */}
      {showMarkers && (
        <div className="relative mt-4">
          <div className="flex justify-between">
            {milestoneMarkers.map((marker) => (
              <div
                key={marker}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                    percentage >= marker
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                />
                <span className="text-xs text-gray-500 mt-1">{marker}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneBar;