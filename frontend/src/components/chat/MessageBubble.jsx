import { motion } from 'framer-motion';

const MessageBubble = ({ message, isOwn, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && message.sender && (
          <img
            src={message.sender.profilePicture || '/default-avatar.png'}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        
        <div>
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-orange-500 text-white rounded-br-none'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;