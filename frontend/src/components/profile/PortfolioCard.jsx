// src/components/profile/PortfolioCard.jsx
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const PortfolioCard = ({ item, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      {item.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{item.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
        
        {item.link && (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
          >
            View Project <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default PortfolioCard;