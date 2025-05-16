// frontend/src/components/common/Button.jsx
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded focus:outline-none transition-all duration-300';
  
  const variantClasses = {
    primary: 'bg-jade-green text-white hover:opacity-90',
    secondary: 'bg-deep-teal text-white hover:opacity-90',
    danger: 'bg-rust text-white hover:opacity-90',
    outline: 'bg-transparent border border-jade-green text-jade-green hover:bg-jade-green hover:text-white',
    ghost: 'bg-transparent text-dark-teal hover:bg-gray-100'
  };
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;