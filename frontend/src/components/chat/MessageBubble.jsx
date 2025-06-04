import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 max-w-[85%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && message.sender && (
          <img
            src={message.sender.profilePicture || '/default-avatar.png'}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-800 flex-shrink-0"
          />
        )}
        
        <div>
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isOwn
                ? 'bg-orange-500 text-white rounded-br-sm shadow-lg shadow-orange-500/20'
                : 'bg-gray-800 text-white rounded-bl-sm border border-gray-700'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          </div>
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <p className="text-xs text-gray-500">
              {timestamp}
            </p>
            {isOwn && (
              <CheckCheck className="w-3 h-3 text-gray-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;