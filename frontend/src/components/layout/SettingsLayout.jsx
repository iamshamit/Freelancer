// src/components/layout/SettingsLayout.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Lock,
  Settings as SettingsIcon
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const SettingsLayout = ({ children, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  
  const settingsNavigation = [
    {
      name: 'Payment',
      href: '/settings/payment',
      icon: CreditCard,
      description: 'Manage payment methods and history'
    },
    {
      name: 'Security',
      href: '/settings/security',
      icon: Lock,
      description: 'Manage password and security'
    },
    {
      name: 'Privacy',
      href: '/settings/privacy',
      icon: Shield,
      description: 'Control your privacy settings'
    }
  ];
  
  return (
    <DashboardLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <SettingsIcon className="h-8 w-8 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingsNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-50 border-l-4 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${
                        isActive ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsLayout;