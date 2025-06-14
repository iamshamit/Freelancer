import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ConnectionStatus = ({ className = '' }) => {
  const { isConnected, socket } = useChat();

  const getStatusInfo = () => {
    if (!socket) {
      return {
        icon: AlertCircle,
        text: 'Connecting...',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    }

    if (isConnected) {
      return {
        icon: CheckCircle,
        text: 'Connected',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    }

    return {
      icon: WifiOff,
      text: 'Disconnected',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    };
  };

  const status = getStatusInfo();
  const IconComponent = status.icon;

  // Only show when not connected or connecting
  if (isConnected && socket) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex items-center justify-center px-3 py-2 rounded-lg border ${status.bgColor} ${status.borderColor} ${className}`}
      >
        <div className="flex items-center space-x-2">
          <IconComponent className={`w-4 h-4 ${status.color}`} />
          <span className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </span>
          {!isConnected && (
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-1 h-1 rounded-full ${status.color.replace('text-', 'bg-')}`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;