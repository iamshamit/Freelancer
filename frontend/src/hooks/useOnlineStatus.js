// frontend/src/hooks/useOnlineStatus.js
import { useState, useEffect, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../context/AuthContext';
import { useSocket } from '../context/ChatContext';

const useOnlineStatus = () => {
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const queryClient = useQueryClient();
  
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [myOnlineStatus, setMyOnlineStatus] = useState({
    isOnline: false,
    lastSeen: null
  });

  // Update user's online status
  const updateMyStatus = useCallback((isOnline) => {
    if (socket && user) {
      socket.emit('update-online-status', {
        userId: user._id,
        isOnline
      });
      setMyOnlineStatus(prev => ({
        ...prev,
        isOnline,
        lastSeen: isOnline ? null : new Date()
      }));
    }
  }, [socket, user]);

  // Get online status for specific user
  const getUserOnlineStatus = useCallback((userId) => {
    return onlineUsers.get(userId) || {
      isOnline: false,
      lastSeen: null
    };
  }, [onlineUsers]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    const status = onlineUsers.get(userId);
    return status?.isOnline === true;
  }, [onlineUsers]);

  // Request online status for specific users
  const requestOnlineStatus = useCallback((userIds) => {
    if (socket && userIds?.length > 0) {
      socket.emit('get-online-status', userIds);
    }
  }, [socket]);

  // Send activity ping to keep status updated
  const sendActivityPing = useCallback(() => {
    if (socket && user) {
      socket.emit('user-activity');
    }
  }, [socket, user]);

  // Format last seen time
  const formatLastSeen = useCallback((lastSeen) => {
    if (!lastSeen) return null;
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenDate.toLocaleDateString();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Handle user coming online
    const handleUserOnline = (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          isOnline: true,
          lastSeen: null,
          name: data.name
        });
        return newMap;
      });
    };

    // Handle user going offline
    const handleUserOffline = (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          isOnline: false,
          lastSeen: data.lastSeen,
          name: data.name
        });
        return newMap;
      });
    };

    // Handle online status updates
    const handleOnlineStatusUpdate = (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
          name: data.name
        });
        return newMap;
      });
    };

    // Handle bulk online status response
    const handleBulkOnlineStatus = (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        Object.entries(data).forEach(([userId, status]) => {
          newMap.set(userId, status);
        });
        return newMap;
      });
    };

    // Register socket listeners
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);
    socket.on('online-status-update', handleOnlineStatusUpdate);
    socket.on('bulk-online-status', handleBulkOnlineStatus);

    // Set up activity ping interval (every 30 seconds)
    const activityInterval = setInterval(() => {
      sendActivityPing();
    }, 30000);

    // Set initial online status
    if (user) {
      updateMyStatus(true);
    }

    // Cleanup
    return () => {
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
      socket.off('online-status-update', handleOnlineStatusUpdate);
      socket.off('bulk-online-status', handleBulkOnlineStatus);
      clearInterval(activityInterval);
    };
  }, [socket, user, sendActivityPing, updateMyStatus]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, don't update to offline immediately
        // Let the server handle timeout
      } else {
        // Page is visible, update to online
        updateMyStatus(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set online when hook mounts
    updateMyStatus(true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Set offline when component unmounts
      updateMyStatus(false);
    };
  }, [updateMyStatus]);

  // Handle window beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateMyStatus(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateMyStatus]);

  return {
    // Status data
    onlineUsers,
    myOnlineStatus,
    
    // Methods
    updateMyStatus,
    getUserOnlineStatus,
    isUserOnline,
    requestOnlineStatus,
    sendActivityPing,
    formatLastSeen,
    
    // Utilities
    onlineUserCount: onlineUsers.size,
    isMyStatusOnline: myOnlineStatus.isOnline
  };
};

export default useOnlineStatus;