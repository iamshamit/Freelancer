// frontend/src/components/common/OnlineStatus.jsx
import React from 'react';
import { Circle } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const OnlineStatus = ({ 
  userId, 
  showText = false, 
  showLastSeen = false, 
  size = 'sm',
  className = '',
  textClassName = ''
}) => {
  const { isUserOnline, getUserOnlineStatus, formatLastSeen } = useOnlineStatus();
  
  if (!userId) return null;
  
  const isOnline = isUserOnline(userId);
  const userStatus = getUserOnlineStatus(userId);
  
  // Size configurations
  const sizeConfig = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const textSizeConfig = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const dotSize = sizeConfig[size] || sizeConfig.sm;
  const textSize = textSizeConfig[size] || textSizeConfig.sm;
  
  return (
    <div className={`flex items-center ${className}`}>
      {/* Online indicator dot */}
      <div className="relative">
        <Circle 
          className={`${dotSize} ${
            isOnline 
              ? 'text-green-500 fill-green-500' 
              : 'text-gray-400 fill-gray-400'
          }`}
        />
        {isOnline && (
          <div className={`absolute inset-0 ${dotSize} bg-green-500 rounded-full animate-ping opacity-75`} />
        )}
      </div>
      
      {/* Status text */}
      {showText && (
        <span className={`ml-2 ${textSize} ${
          isOnline ? 'text-green-500' : 'text-gray-500'
        } ${textClassName}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
      
      {/* Last seen text */}
      {showLastSeen && !isOnline && userStatus.lastSeen && (
        <span className={`ml-2 ${textSize} text-gray-500 ${textClassName}`}>
          Last seen {formatLastSeen(userStatus.lastSeen)}
        </span>
      )}
    </div>
  );
};

// Alternative compact version for chat lists
export const OnlineStatusBadge = ({ userId, className = '' }) => {
  const { isUserOnline } = useOnlineStatus();
  
  if (!userId) return null;
  
  const isOnline = isUserOnline(userId);
  
  if (!isOnline) return null;
  
  return (
    <div className={`absolute -bottom-0.5 -right-0.5 ${className}`}>
      <div className="w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full">
        <div className="w-full h-full bg-green-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

// Status text component for detailed views
export const OnlineStatusText = ({ 
  userId, 
  className = '',
  showIcon = true,
  showLastSeen = true 
}) => {
  const { isUserOnline, getUserOnlineStatus, formatLastSeen } = useOnlineStatus();
  
  if (!userId) return null;
  
  const isOnline = isUserOnline(userId);
  const userStatus = getUserOnlineStatus(userId);
  
  return (
    <div className={`flex items-center text-sm ${className}`}>
      {showIcon && (
        <Circle className={`w-2 h-2 mr-2 ${
          isOnline 
            ? 'text-green-500 fill-green-500' 
            : 'text-gray-400 fill-gray-400'
        }`} />
      )}
      
      <span className={isOnline ? 'text-green-500' : 'text-gray-500'}>
        {isOnline ? 'Online now' : 'Offline'}
      </span>
      
      {showLastSeen && !isOnline && userStatus.lastSeen && (
        <span className="text-gray-500 ml-1">
          • Last seen {formatLastSeen(userStatus.lastSeen)}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;