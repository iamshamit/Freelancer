import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatList from '../../components/chat/ChatList';

const ArchivedChatsPage = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Archive className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Archived Chats
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            View your completed project conversations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <ChatList showArchived={true} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ArchivedChatsPage;