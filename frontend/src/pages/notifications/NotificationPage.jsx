// src/pages/notifications/NotificationPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NotificationPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    if (location.pathname.includes('settings')) {
      setActiveTab('notifications/settings');
    } else {
      setActiveTab('notifications');
    }
  }, [location.pathname]);

  const tabs = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationCenter,
    },
    {
      id: 'notifications/settings',
      label: 'Preferences',
      icon: Settings,
      component: NotificationPreferences,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

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
                  <Link
                    key={tab.id}
                    to={`/notifications${tab.id === 'notifications' ? '' : '/settings'}`}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {ActiveComponent && <ActiveComponent />}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationPage;