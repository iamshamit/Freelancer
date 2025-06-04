import { useState, useContext, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Archive, MessageSquare, Search, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';

const ChatList = ({ showArchived = false }) => {
  const { user } = useContext(AuthContext);
  const { id: activeChatId } = useParams();
  const { unreadMessages } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch chats
  const { data: chats = [], isLoading, error } = useQuery({
    queryKey: ['chats', showArchived ? 'archived' : 'active'],
    queryFn: showArchived ? api.chat.getArchived : api.chat.getAll,
    refetchInterval: 10000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    return chats.filter(chat => {
      const otherUser = chat.employer._id === user._id ? chat.freelancer : chat.employer;
      const searchLower = searchQuery.toLowerCase();
      
      return (
        otherUser.name.toLowerCase().includes(searchLower) ||
        chat.job.title.toLowerCase().includes(searchLower) ||
        (chat.messages.length > 0 && 
         chat.messages[chat.messages.length - 1].content.toLowerCase().includes(searchLower))
      );
    });
  }, [chats, searchQuery, user._id]);

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMessage = chat.messages[chat.messages.length - 1];
    const isOwnMessage = lastMessage.sender === user._id || lastMessage.sender._id === user._id;
    return `${isOwnMessage ? 'You: ' : ''}${lastMessage.content}`;
  };

  const getLastMessageTime = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return '';
    }
    const lastMessage = chat.messages[chat.messages.length - 1];
    return formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true });
  };

  const getOtherUser = (chat) => {
    return chat.employer._id === user._id ? chat.freelancer : chat.employer;
  };

  const getJobStatus = (chat) => {
    if (chat.job.milestonePercentage === 100) {
      return { text: 'Completed', color: 'text-green-400' };
    } else if (chat.job.milestonePercentage > 0) {
      return { text: `${chat.job.milestonePercentage}% Complete`, color: 'text-orange-400' };
    }
    return { text: 'Active', color: 'text-blue-400' };
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading chats</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <SkeletonLoader type="chatList" count={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400 text-center">
              {searchQuery ? 'No chats found' : showArchived ? 'No archived chats' : 'No active chats'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat, index) => {
              const otherUser = getOtherUser(chat);
              const hasUnread = unreadMessages[chat._id] > 0;
              const isActive = chat._id === activeChatId;
              const jobStatus = getJobStatus(chat);

              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/chat/${chat._id}`}
                    className={`flex items-center px-4 py-3 hover:bg-gray-700/50 transition-all duration-200 border-b border-gray-700/50 ${
                      isActive ? 'bg-gray-700/30 border-l-2 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="relative mr-3">
                      <img
                        src={otherUser.profilePicture || '/default-avatar.png'}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700"
                      />
                      {hasUnread && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-gray-800 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-white truncate pr-2">
                          {otherUser.name}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {getLastMessageTime(chat)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 truncate pr-2">
                          {getLastMessage(chat)}
                        </p>
                        {hasUnread && (
                          <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                            {unreadMessages[chat._id]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-gray-500 truncate">
                          {chat.job.title}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className={`text-xs font-medium ${jobStatus.color}`}>
                          {jobStatus.text}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ChatList;