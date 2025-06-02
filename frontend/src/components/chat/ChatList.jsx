import { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Archive, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import SkeletonLoader from '../common/SkeletonLoader';
import EmptyState from '../common/EmptyState';

const ChatList = ({ showArchived = false }) => {
  const { user } = useContext(AuthContext);
  const { id: activeChatId } = useParams();
  const { unreadMessages } = useChat();

  // Fetch chats
  const { data: chats = [], isLoading, error } = useQuery({
    queryKey: ['chats', showArchived ? 'archived' : 'active'],
    queryFn: showArchived ? api.chat.getArchived : api.chat.getAll,
    refetchInterval: 10000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
    isLoadingInitialData: true,
    onError: (error) => {
      console.error('Chat fetch error:', error);
    },
    onSuccess: (data) => {
      console.log('Chat data received:', data);
    }
  });


  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content;
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

  if (error) {
    console.error('Error loading chats:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading chats</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(chats)) {
    console.error('Chats data is not an array:', chats);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Invalid data format</p>
          <p className="text-sm text-gray-500">Expected array, got: {typeof chats}</p>
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
  if (chats.length === 0) {
    return (
      <EmptyState
        icon={showArchived ? Archive : MessageSquare}
        title={showArchived ? "No archived chats" : "No active chats"}
        description={showArchived 
          ? "Completed project chats will appear here" 
          : "Start a conversation by selecting a freelancer for your job"
        }
      />
    );
  }
  
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat);
        const chatId = chat._id;
        const isActive = activeChatId === chatId;
        const hasUnread = unreadMessages[chatId] > 0;

        return (
          <Link
            key={chatId}
            to={`/chat/${chatId}`}
            className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              isActive ? 'bg-orange-50 dark:bg-orange-900/20' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <img
                  src={otherUser.profilePicture || '/default-avatar.png'}
                  alt={otherUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {otherUser.name}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getLastMessageTime(chat)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {chat.job.title}
                </p>
                
                <p className={`text-sm mt-1 truncate ${
                  hasUnread 
                    ? 'font-semibold text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getLastMessage(chat)}
                </p>
                
                {hasUnread && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full mt-1">
                    {unreadMessages[chatId]}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ChatList;