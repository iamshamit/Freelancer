// frontend/src/components/common/OnlineStatus.jsx
import { useSocket } from '../../context/SocketContext';

const OnlineStatus = ({ userId, showText = false, className = "" }) => {
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(userId);

  if (showText) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`h-2 w-2 rounded-full mr-2 ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div className={`h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
      isOnline ? 'bg-green-500' : 'bg-gray-400'
    } ${className}`}></div>
  );
};

export default OnlineStatus;