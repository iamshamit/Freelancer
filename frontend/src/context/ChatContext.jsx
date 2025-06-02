import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import api from '../services/api';
import AuthContext from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const queryClient = useQueryClient();

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('join', user._id);
      });

      newSocket.on('newMessage', (data) => {
        // Update chat messages in cache
        queryClient.invalidateQueries(['chat', data.chatId]);
        
        // Update unread messages if not in active chat
        if (activeChat !== data.chatId) {
          setUnreadMessages(prev => ({
            ...prev,
            [data.chatId]: (prev[data.chatId] || 0) + 1
          }));
        }

        // Show notification toast
        if (data.sender !== user._id) {
          toast.success('New message received!');
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, queryClient, activeChat]);

  // Mark messages as read
  const markAsRead = useCallback((chatId) => {
    setUnreadMessages(prev => {
      const newUnread = { ...prev };
      delete newUnread[chatId];
      return newUnread;
    });
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content }) => api.chat.sendMessage(chatId, content),
    onSuccess: (data, variables) => {
      console.log('Message sent successfully:', data);
      
      try {
        // Emit socket event
        if (socket) {
          const chat = queryClient.getQueryData(['chat', variables.chatId]);
          if (chat) {
            const recipient = chat.employer._id === user._id ? chat.freelancer._id : chat.employer._id;
            
            socket.emit('sendMessage', {
              chatId: variables.chatId,
              message: data,
              sender: user._id,
              recipient
            });
          }
        }
        
        // Invalidate chat query to refetch messages
        queryClient.invalidateQueries(['chat', variables.chatId]);
        queryClient.invalidateQueries(['chats']);
      } catch (socketError) {
        console.error('Socket emission error:', socketError);
        // Don't show error to user since message was sent successfully
      }
    },
    onError: (error) => {
      console.error('Send message error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      toast.error(errorMessage);
    }
  });

  const value = {
    socket,
    activeChat,
    setActiveChat,
    unreadMessages,
    markAsRead,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;