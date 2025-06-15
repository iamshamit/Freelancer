import { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Archive, X, Info, Phone, Video } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import EmptyState from '../common/EmptyState';
import SkeletonLoader from '../common/SkeletonLoader';
import { useSocket } from '../../context/SocketContext';

const ChatBox = ({ chatId, onClose, isFullPage = false }) => {
  const { user } = useContext(AuthContext);
  const { setActiveChat, markAsRead } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const { isUserOnline } = useSocket();

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

  // Update your ChatBox loading section to remove the centering wrapper:
  if (isLoading) {
    return <>
      <SkeletonLoader type='chatbox'/>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-800 border-t border-gray-700">
        <ChatInput chatId={chatId} />
      </div>
    </>
    
  }

  if (error || !chat) {
    return (
      <div className="bg-gray-900 h-full flex items-center justify-center">
        <EmptyState
          title="Chat not found"
          description="This chat may have been deleted or you don't have access to it."
        />
      </div>
    );
  }

  const otherUser = chat.employer._id === user._id ? chat.freelancer : chat.employer;
  const messageGroups = groupMessagesByDate(chat.messages);

  return (
    <div className="flex flex-col bg-gray-900 h-full relative">
      {/* Chat Header - Enhanced with gradient */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-800 border-b border-gray-700 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={otherUser.profilePicture || '/default-avatar.png'}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                  isUserOnline(otherUser._id) ? 'bg-green-500' : 'bg-gray-500'
                }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                {otherUser.name}
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-400">
                  {chat.job.title}
                </p>
                <span className="text-gray-600">•</span>
                <span className={`text-xs font-medium ${
                  chat.job.milestonePercentage === 100 
                    ? 'text-green-400' 
                    : chat.job.milestonePercentage > 0
                    ? 'text-orange-400'
                    : 'text-blue-400'
                }`}>
                  {chat.job.milestonePercentage === 100 
                    ? 'Completed' 
                    : chat.job.milestonePercentage > 0
                    ? `${chat.job.milestonePercentage}% Complete`
                    : 'Active'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Phone className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Video className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Info className="w-5 h-5 text-gray-400" />
            </button>
            {!isFullPage && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area - Full width with padding */}
      <div className="flex-1 overflow-y-auto pt-[88px] pb-[88px] bg-gray-900">
        <div className="py-4 px-4 md:px-6 lg:px-8">
          {Object.entries(messageGroups).map(([date, messages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="bg-gray-800 border border-gray-700 px-4 py-1.5 rounded-full">
                  <span className="text-xs text-gray-400 font-medium">
                    {getDateLabel(date)}
                  </span>
                </div>
              </div>
              
              {/* Messages */}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message._id || index}
                    message={message}
                    isOwn={message.sender._id === user._id}
                    timestamp={formatMessageDate(message.timestamp)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input - Full width with fixed height */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-800 border-t border-gray-700">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
};

export default ChatBox;