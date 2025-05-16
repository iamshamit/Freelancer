// frontend/src/components/common/Card.jsx
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  onClick, 
  hover = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow p-6';
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-md' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      whileHover={onClick ? { y: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;