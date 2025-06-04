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
    <form onSubmit={handleSubmit} className="h-full flex items-center px-2">
      <div className="w-full flex items-center gap-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500 transition-all text-sm"
            rows="1"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className={`p-2.5 rounded-lg transition-all duration-200 ${
            message.trim() && !isSending
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send className={`w-5 h-5 transition-transform duration-200 ${
            message.trim() && !isSending ? 'hover:translate-x-0.5' : ''
          }`} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;