// frontend/src/context/ChatContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import AuthContext from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { socket, isConnected, joinChat, leaveChat, sendMessage: socketSendMessage } = useSocket();
  const [activeChat, setActiveChat] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [optimisticMessages, setOptimisticMessages] = useState({}); // Store optimistic messages
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const queryClient = useQueryClient();

  // Listen for socket events
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data) => {
      console.log('💬 New message received:', data);
      
      // Remove optimistic message if it exists (message confirmed from server)
      setOptimisticMessages(prev => {
        const newOptimistic = { ...prev };
        if (newOptimistic[data.chatId]) {
          // Remove any optimistic messages that match this real message
          newOptimistic[data.chatId] = newOptimistic[data.chatId].filter(
            optMsg => optMsg.tempId !== data.message.tempId
          );
          if (newOptimistic[data.chatId].length === 0) {
            delete newOptimistic[data.chatId];
          }
        }
        return newOptimistic;
      });
      
      // Update React Query cache directly for instant update
      queryClient.setQueryData(['chat', data.chatId], (oldData) => {
        if (!oldData) return oldData;
        
        // Check if message already exists (avoid duplicates)
        const messageExists = oldData.messages.some(msg => 
          msg._id === data.message._id || msg.tempId === data.message.tempId
        );
        
        if (!messageExists) {
          return {
            ...oldData,
            messages: [...oldData.messages, data.message]
          };
        }
        return oldData;
      });
      
      // Update chat list cache
      queryClient.setQueryData(['chats', 'active'], (oldData) => {
        if (!oldData) return oldData;
        
        return oldData.map(chat => 
          chat._id === data.chatId 
            ? { ...chat, messages: [...(chat.messages || []), data.message] }
            : chat
        );
      });
      
      // Handle unread messages and notifications
      if (activeChat !== data.chatId) {
        setUnreadMessages(prev => ({
          ...prev,
          [data.chatId]: (prev[data.chatId] || 0) + 1
        }));
        
        if (data.sender !== user._id) {
          toast.success('New message received!');
        }
      }
    };

    const handleTypingStart = ({ chatId, userId, userName }) => {
      if (userId !== user._id) {
        setTypingUsers(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []).filter(u => u.userId !== userId), { userId, userName }]
        }));
      }
    };

    const handleTypingStop = ({ chatId, userId }) => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter(user => user.userId !== userId)
      }));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
    };
  }, [socket, user, activeChat, queryClient]);

  // Join/leave chat rooms when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    joinChat(activeChat);
    
    return () => {
      leaveChat(activeChat);
    };
  }, [activeChat, joinChat, leaveChat]);

  const markAsRead = useCallback((chatId) => {
    setUnreadMessages(prev => {
      const newUnread = { ...prev };
      delete newUnread[chatId];
      return newUnread;
    });

    if (socket && isConnected) {
      socket.emit('mark-messages-read', { chatId });
    }
  }, [socket, isConnected]);

  // Optimized typing indicator with debouncing
  const sendTypingIndicator = useCallback((chatId, isTyping) => {
    if (!socket || !isConnected) return;

    if (isTyping) {
      // Debounce typing start events
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      
      typingDebounceRef.current = setTimeout(() => {
        socket.emit('typing-start', { chatId, userId: user._id, userName: user.name });
      }, 100); // 100ms debounce
      
      // Clear existing timeout and set new one for auto-stop
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', { chatId, userId: user._id });
      }, 2000); // Stop typing after 2 seconds of inactivity
    } else {
      // Clear debounce and immediately stop typing
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      socket.emit('typing-stop', { chatId, userId: user._id });
    }
  }, [socket, isConnected, user]);

  // Optimistic message sending
  const sendMessageOptimistic = useCallback(({ chatId, content }) => {
    if (!content?.trim()) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticMessage = {
      _id: tempId,
      tempId,
      sender: {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture
      },
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isOptimistic: true // Flag to identify optimistic messages
    };

    // 1. Immediately add to optimistic messages for instant UI update
    setOptimisticMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), optimisticMessage]
    }));

    // 2. Immediately emit via socket (don't wait for API)
    if (socket && isConnected) {
      const chat = queryClient.getQueryData(['chat', chatId]);
      if (chat) {
        const recipient = chat.employer._id === user._id ? chat.freelancer._id : chat.employer._id;
        
        socketSendMessage({
          chatId,
          message: { ...optimisticMessage, tempId }, // Include tempId for deduplication
          sender: user._id,
          recipient
        });
      }
    }

    // 3. Send to API in background
    sendMessageMutation.mutate({ chatId, content: content.trim(), tempId });

    // 4. Stop typing indicator
    sendTypingIndicator(chatId, false);
  }, [user, socket, isConnected, socketSendMessage, queryClient, sendTypingIndicator]);

  // Send message mutation (runs in background)
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content, tempId }) => api.chat.sendMessage(chatId, content, tempId),
    onSuccess: (data, variables) => {
      console.log('✅ Message confirmed by server:', data);
      
      // Remove optimistic message since real message will come via socket
      setOptimisticMessages(prev => {
        const newOptimistic = { ...prev };
        if (newOptimistic[variables.chatId]) {
          newOptimistic[variables.chatId] = newOptimistic[variables.chatId].filter(
            msg => msg.tempId !== variables.tempId
          );
          if (newOptimistic[variables.chatId].length === 0) {
            delete newOptimistic[variables.chatId];
          }
        }
        return newOptimistic;
      });
    },
    onError: (error, variables) => {
      console.error('❌ Message failed to send:', error);
      
      // Mark optimistic message as failed
      setOptimisticMessages(prev => {
        const newOptimistic = { ...prev };
        if (newOptimistic[variables.chatId]) {
          newOptimistic[variables.chatId] = newOptimistic[variables.chatId].map(msg =>
            msg.tempId === variables.tempId
              ? { ...msg, failed: true, error: error.message }
              : msg
          );
        }
        return newOptimistic;
      });
      
      toast.error('Failed to send message. Tap to retry.');
    }
  });

  // Retry failed message
  const retryMessage = useCallback(({ chatId, content, tempId }) => {
    // Remove failed flag
    setOptimisticMessages(prev => {
      const newOptimistic = { ...prev };
      if (newOptimistic[chatId]) {
        newOptimistic[chatId] = newOptimistic[chatId].map(msg =>
          msg.tempId === tempId
            ? { ...msg, failed: false, error: null }
            : msg
        );
      }
      return newOptimistic;
    });

    // Retry API call
    sendMessageMutation.mutate({ chatId, content, tempId });
  }, [sendMessageMutation]);

  const value = {
    isConnected,
    activeChat,
    setActiveChat,
    unreadMessages,
    markAsRead,
    sendMessage: sendMessageOptimistic, // Use optimistic version
    isSending: sendMessageMutation.isPending,
    typingUsers,
    sendTypingIndicator,
    optimisticMessages,
    retryMessage,
    socket
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