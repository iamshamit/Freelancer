// frontend/src/components/ratings/RatingStarsInput.jsx
import { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStarsInput = ({ 
  value = 0, 
  onChange, 
  disabled = false, 
  size = 'md' 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const handleClick = (rating) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || value);
        
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={`
              transition-all duration-150 
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
              ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
            `}
          >
            <Star 
              className={`${sizeClasses[size]} ${isFilled ? 'fill-current' : ''}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStarsInput;