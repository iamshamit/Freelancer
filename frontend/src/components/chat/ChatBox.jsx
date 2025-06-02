import { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, MoreVertical, Archive, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const ChatBox = ({ chatId, onClose, isFullPage = false }) => {
  const { user } = useContext(AuthContext);
  const { setActiveChat, markAsRead } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch chat data
  const { data: chat, isLoading, error } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => api.chat.getById(chatId),
    enabled: !!chatId,
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  // Archive chat mutation
  const archiveMutation = useMutation({
    mutationFn: () => api.chat.archive(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries(['chats']);
      if (onClose) onClose();
    }
  });

  // Set active chat and mark as read
  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
      markAsRead(chatId);
    }
    return () => setActiveChat(null);
  }, [chatId, setActiveChat, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'h:mm a')}`;
    }
    return format(messageDate, 'MMM d, h:mm a');
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages?.forEach(message => {
      const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !chat) {
    return (
      <EmptyState
        title="Chat not found"
        description="This chat may have been deleted or you don't have access to it."
      />
    );
  }

  const otherUser = chat.employer._id === user._id ? chat.freelancer : chat.employer;
  const messageGroups = groupMessagesByDate(chat.messages);

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 ${isFullPage ? 'h-screen' : 'h-full'}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={otherUser.profilePicture || '/default-avatar.png'}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {otherUser.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chat.job.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                >
                  <button
                    onClick={() => archiveMutation.mutate()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Chat
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!isFullPage && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(messageGroups).map(([date, messages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {getDateLabel(date)}
                </span>
              </div>
            </div>
            
            {/* Messages */}
            {messages.map((message, index) => (
              <MessageBubble
                key={message._id || index}
                message={message}
                isOwn={message.sender._id === user._id}
                timestamp={formatMessageDate(message.timestamp)}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput chatId={chatId} />
    </div>
  );
};

export default ChatBox;