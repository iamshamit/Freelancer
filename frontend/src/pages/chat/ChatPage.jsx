import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Archive, MessageSquare, ChevronLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatList from '../../components/chat/ChatList';
import ChatBox from '../../components/chat/ChatBox';
import Button from '../../components/common/Button';

const ChatPage = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Chat List Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Messages
            </h2>
            
            {/* Toggle between active and archived */}
            <div className="flex space-x-2">
              <Button
                variant={!showArchived ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowArchived(false)}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Active
              </Button>
              <Button
                variant={showArchived ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowArchived(true)}
                className="flex-1"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archived
              </Button>
            </div>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <ChatList showArchived={showArchived} />
          </div>
        </motion.div>

        {/* Chat Box */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
          {chatId ? (
            <motion.div
              key={chatId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full"
            >
              <ChatBox chatId={chatId} isFullPage={true} />
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a chat from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Back Button */}
        {chatId && (
          <button
            onClick={() => navigate('/messages')}
            className="md:hidden fixed top-20 left-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;