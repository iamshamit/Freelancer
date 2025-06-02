import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatInput = ({ chatId }) => {
  const [message, setMessage] = useState('');
  const { sendMessage, isSending } = useChat();
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      sendMessage({ chatId, content: message.trim() });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className={`p-2 rounded-lg transition-colors ${
            message.trim() && !isSending
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;