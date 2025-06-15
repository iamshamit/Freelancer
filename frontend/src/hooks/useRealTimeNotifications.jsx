// frontend/src/hooks/useRealTimeNotifications.jsx
import { useSocket } from '../context/SocketContext';

const useRealTimeNotifications = () => {
  const { 
    isConnected, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useSocket();

  return {
    isConnected,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };
};

export default useRealTimeNotifications;