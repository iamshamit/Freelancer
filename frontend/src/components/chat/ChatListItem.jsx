import React, { useState } from 'react';
import { 
  Circle, 
  Archive, 
  MoreVertical, 
  Trash2,
  User
} from 'lucide-react';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';

const ChatListItem = ({ 
  chat, 
  isActive, 
  onClick, 
  onArchive, 
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  if (!chat) return null;

  const otherUser = chat.otherUser || {};
  const presence = otherUser.presence || { status: 'offline', isOnline: false };
  const unreadCount = chat.unreadCount || 0;
  const lastMessage = chat.lastMessage || chat.messages?.[chat.messages.length - 1];

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = differenceInMinutes(now, date);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Get presence status color and text
  const getPresenceInfo = () => {
    if (presence.status === 'hidden') {
      return { color: 'bg-gray-400', text: 'Hidden', show: false };
    }
    
    switch (presence.status) {
      case 'online': {
        return { color: 'bg-green-500', text: 'Online', show: true };
      }
      case 'offline': {
        const lastSeen = presence.lastSeen;
        if (lastSeen) {
          const diffMinutes = differenceInMinutes(new Date(), new Date(lastSeen));
          if (diffMinutes < 5) {
            return { color: 'bg-yellow-500', text: 'Just left', show: true };
          } else if (diffMinutes < 60) {
            return { color: 'bg-gray-400', text: `${diffMinutes}m ago`, show: true };
          }
        }
        return { color: 'bg-gray-400', text: 'Offline', show: false };
      }
      default: {
        return { color: 'bg-gray-400', text: 'Unknown', show: false };
      }
    }
  };

  const presenceInfo = getPresenceInfo();

  // Truncate message content
  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    
    switch (action) {
      case 'archive':
        onArchive?.(chat._id);
        break;
      case 'delete':
        onDelete?.(chat._id);
        break;
    }
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500/10 border-l-4 border-orange-500 shadow-sm' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
      onClick={onClick}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3">
          {/* User Avatar with Presence Indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {otherUser.profilePicture ? (
                <img
                  src={otherUser.profilePicture}
                  alt={otherUser.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Online Status Indicator */}
            {presenceInfo.show && (
              <div className="absolute -bottom-1 -right-1">
                <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${presenceInfo.color}`} />
              </div>
            )}
          </div>

          {/* Chat Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h3 className={`font-medium truncate ${
                  isActive 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {otherUser.name || 'Unknown User'}
                </h3>
                
                {/* Project Badge */}
                {chat.job?.title && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {chat.job.title.length > 15 ? chat.job.title.substring(0, 15) + '...' : chat.job.title}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(lastMessage?.createdAt || chat.updatedAt)}
                </span>

                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={(e) => handleMenuAction('archive', e)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rounded-t-lg"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive</span>
                      </button>
                      <button
                        onClick={(e) => handleMenuAction('delete', e)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 rounded-b-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Last Message Preview */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {lastMessage ? (
                  <div className="flex items-center space-x-2">
                    <p className={`text-sm truncate ${
                      unreadCount > 0 
                        ? 'font-medium text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {lastMessage.sender === otherUser._id ? '' : 'You: '}
                      {truncateMessage(lastMessage.content)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No messages yet
                  </p>
                )}
              </div>

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <div className="ml-2 flex-shrink-0">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full min-w-[20px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              )}
            </div>

            {/* Online Status Text (shown only when relevant) */}
            {presenceInfo.show && presenceInfo.text !== 'Offline' && (
              <div className="flex items-center space-x-1 mt-1">
                <Circle className={`w-2 h-2 ${presenceInfo.color.replace('bg-', 'fill-').replace('bg-', 'text-')}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {presenceInfo.text}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click overlay to close menu when clicking elsewhere */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ChatListItem;