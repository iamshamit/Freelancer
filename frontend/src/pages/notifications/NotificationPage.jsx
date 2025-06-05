// src/pages/notifications/NotificationPage.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationCenter
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Settings,
      component: NotificationPreferences
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Tab Navigation */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
  
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="py-6"
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationPage;