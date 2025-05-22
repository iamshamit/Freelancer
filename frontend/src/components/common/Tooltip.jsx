// src/components/common/Tooltip.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300,
  offset = 8,
  maxWidth = 250,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  // Calculate position based on trigger element
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;
    
    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top - tooltipRect.height - offset;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.bottom + offset;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      default:
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top - tooltipRect.height - offset;
    }
    
    // Ensure tooltip stays within viewport
    const padding = 10;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));
    
    setTooltipPosition({ x, y });
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      // Update position after a small delay to ensure tooltip is rendered
      setTimeout(updatePosition, 10);
    }, delay);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  };

  // Update position on window resize
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.15, ease: 'easeOut' }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15, ease: 'easeOut' }
    }
  };

  // Get arrow direction based on position
  const getArrowClass = () => {
    switch (position) {
      case 'top': return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-800 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom': return 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-800 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent';
      case 'left': return 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700 border-t-transparent border-r-transparent border-b-transparent';
      case 'right': return 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700 border-t-transparent border-l-transparent border-b-transparent';
      default: return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-800 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <AnimatePresence>
          <motion.div
            ref={tooltipRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex: 50,
              maxWidth: maxWidth,
            }}
            className={`pointer-events-none ${className}`}
          >
            <div className="bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md py-1.5 px-3 shadow-lg">
              {content}
              <div className={`absolute w-0 h-0 border-4 ${getArrowClass()}`} />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;