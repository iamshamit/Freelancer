// src/pages/settings/PrivacySettings.jsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Search,
  Save,
  AlertTriangle,
  Globe,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import SettingsLayout from '../../components/layout/SettingsLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PrivacySettings = ({ darkMode, toggleDarkMode }) => {
  const queryClient = useQueryClient();
  
  // Fetch privacy settings
  const { data: privacySettings, isLoading } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: () => api.security.getPrivacySettings()
  });
  
  const [localSettings, setLocalSettings] = useState({
    search: {
      appearInSearch: true,
      showInDirectory: true
    },
    activity: {
      showOnlineStatus: true,
      showLastSeen: false
    }
  });
  
  // Update local settings when API data is loaded
  React.useEffect(() => {
    if (privacySettings) {
      setLocalSettings(privacySettings);
    }
  }, [privacySettings]);
  
  const updatePrivacyMutation = useMutation({
    mutationFn: (settings) => api.security.updatePrivacySettings(settings),
    onSuccess: () => {
      toast.success('Privacy settings updated successfully');
      queryClient.invalidateQueries(['privacy-settings']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update privacy settings');
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (data) => api.security.deleteAccount(data),
    onSuccess: () => {
      toast.success('Account has been deactivated');
      // Redirect to login or home page
      window.location.href = '/';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  });
  
  const handleToggle = (category, setting) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };
  
  const handleSave = () => {
    updatePrivacyMutation.mutate(localSettings);
  };

  const handleDeleteAccount = () => {
    const password = prompt('Please enter your password to confirm account deletion:');
    if (!password) return;

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    deleteAccountMutation.mutate({ password, confirmText });
  };
  
  if (isLoading) {
    return (
      <SettingsLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </SettingsLayout>
    );
  }
  
  return (
    <SettingsLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Control your privacy and who can see your information
          </p>
        </div>
        
        {/* Privacy Overview */}
        <div className="mb-8 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Privacy Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your privacy settings help control how your information is shared
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Discovery</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {localSettings.search?.appearInSearch ? 'Visible' : 'Hidden'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Activity Status</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {localSettings.activity?.showOnlineStatus ? 'Visible' : 'Hidden'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy Settings */}
        <div className="space-y-6">
          {/* Discovery & Search Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Discovery & Search
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control how others can find and contact you
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Appear in Search Results
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Allow others to find you in search results
                    </p>
                    <small className="text-orange-600 dark:text-orange-400">
                      ⚠️ Disabling this will make you less visible to potential clients
                    </small>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggle('search', 'appearInSearch')}
                      disabled={updatePrivacyMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        localSettings.search?.appearInSearch ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.search?.appearInSearch ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Show in Freelancer Directory
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Show your profile in the freelancer directory
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggle('search', 'showInDirectory')}
                      disabled={updatePrivacyMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        localSettings.search?.showInDirectory ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.search?.showInDirectory ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Activity Privacy
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control visibility of your activity and status
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Show Online Status
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Show when you are online and available
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggle('activity', 'showOnlineStatus')}
                      disabled={updatePrivacyMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        localSettings.activity?.showOnlineStatus ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.activity?.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Show Last Seen
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Show when you were last active on the platform
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggle('activity', 'showLastSeen')}
                      disabled={updatePrivacyMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        localSettings.activity?.showLastSeen ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.activity?.showLastSeen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Account Deletion */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Danger Zone
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Irreversible actions for your account
                </p>
              </div>
            </div>
            
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="font-medium text-red-900 dark:text-red-300">
                  Delete Account
                </h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Permanently deactivate your account. This action cannot be undone.
              </p>
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleDeleteAccount}
                loading={deleteAccountMutation.isPending}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={updatePrivacyMutation.isPending}
            loading={updatePrivacyMutation.isPending}
            icon={<Save className="h-4 w-4" />}
          >
            Save Privacy Settings
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default PrivacySettings;