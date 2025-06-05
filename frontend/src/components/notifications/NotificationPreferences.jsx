// src/components/notifications/NotificationPreferences.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, Mail, Smartphone, Monitor, Volume2, VolumeX,
  Briefcase, MessageSquare, DollarSign, Star, CheckCircle,
  Save, RotateCcw, TestTube
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import SkeletonLoader from '../common/SkeletonLoader';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    email: {
      enabled: true,
      frequency: 'immediate', // immediate, daily, weekly
      types: {
        new_application: true,
        job_assigned: true,
        milestone_completed: true,
        payment_released: true,
        new_message: true,
        new_rating: true
      }
    },
    push: {
      enabled: true,
      types: {
        new_application: true,
        job_assigned: true,
        milestone_completed: true,
        payment_released: true,
        new_message: true,
        new_rating: false
      }
    },
    inApp: {
      enabled: true,
      sound: true,
      types: {
        new_application: true,
        job_assigned: true,
        milestone_completed: true,
        payment_released: true,
        new_message: true,
        new_rating: true
      }
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  // Notification types configuration
  const notificationTypes = [
    {
      id: 'new_application',
      label: 'New Job Applications',
      description: 'When someone applies to your job posting',
      icon: Briefcase,
      color: 'orange'
    },
    {
      id: 'job_assigned',
      label: 'Job Assignments',
      description: 'When you are selected for a job',
      icon: CheckCircle,
      color: 'orange'
    },
    {
      id: 'milestone_completed',
      label: 'Milestone Updates',
      description: 'When milestones are completed or need approval',
      icon: CheckCircle,
      color: 'orange'
    },
    {
      id: 'payment_released',
      label: 'Payment Notifications',
      description: 'When payments are released or received',
      icon: DollarSign,
      color: 'orange'
    },
    {
      id: 'new_message',
      label: 'New Messages',
      description: 'When you receive new chat messages',
      icon: MessageSquare,
      color: 'orange'
    },
    {
      id: 'new_rating',
      label: 'Reviews & Ratings',
      description: 'When you receive new reviews or ratings',
      icon: Star,
      color: 'orange'
    }
  ];

  // Fetch current preferences
  const { data: currentPreferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.notification.getPreferences(),
    onSuccess: (data) => {
      if (data) {
        setPreferences(data);
      }
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (newPreferences) => api.notification.updatePreferences(newPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setHasChanges(false);
      toast.success('Notification preferences updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    }
  });

  // Send test notification mutation
  const sendTestMutation = useMutation({
    mutationFn: (type) => api.notification.sendTest(type),
    onSuccess: () => {
      toast.success('Test notification sent!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send test notification');
    }
  });

  // Handle preference changes
  const updatePreference = (section, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateTypePreference = (section, type, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        types: {
          ...prev[section].types,
          [type]: value
        }
      }
    }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  // Handle reset
  const handleReset = () => {
    if (currentPreferences) {
      setPreferences(currentPreferences);
      setHasChanges(false);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!');
        updatePreference('push', 'enabled', true);
      } else {
        toast.error('Browser notifications denied');
        updatePreference('push', 'enabled', false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize how and when you receive notifications
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              disabled={updatePreferencesMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications via email
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email.enabled}
              onChange={(e) => updatePreference('email', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {preferences.email.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Email frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Frequency
              </label>
              <select
                value={preferences.email.frequency}
                onChange={(e) => updatePreference('email', 'frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>

            {/* Email notification types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Email Notification Types
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notificationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <label
                      key={type.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.email.types[type.id]}
                        onChange={(e) => updateTypePreference('email', type.id, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                        <IconComponent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Smartphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Browser Push Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive instant notifications in your browser
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!('Notification' in window) ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                Not Supported
              </span>
            ) : Notification.permission === 'denied' ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                Blocked
              </span>
            ) : Notification.permission === 'granted' ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                Enabled
              </span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Enable
              </button>
            )}
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.push.enabled && Notification.permission === 'granted'}
                onChange={(e) => updatePreference('push', 'enabled', e.target.checked)}
                disabled={Notification.permission !== 'granted'}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600 disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        {preferences.push.enabled && Notification.permission === 'granted' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notificationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={preferences.push.types[type.id]}
                      onChange={(e) => updateTypePreference('push', type.id, e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                      <IconComponent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {type.description}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        sendTestMutation.mutate(type.id);
                      }}
                      disabled={sendTestMutation.isPending}
                      className="ml-2 p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TestTube className="h-3 w-3" />
                    </button>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* In-App Notifications */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Monitor className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                In-App Notifications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show notifications within the application
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.inApp.enabled}
              onChange={(e) => updatePreference('inApp', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {preferences.inApp.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Sound settings */}
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                  {preferences.inApp.sound ? (
                    <Volume2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Notification Sounds
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Play sound when notifications arrive
                  </div>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inApp.sound}
                  onChange={(e) => updatePreference('inApp', 'sound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {/* In-app notification types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                In-App Notification Types
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notificationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <label
                      key={type.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.inApp.types[type.id]}
                        onChange={(e) => updateTypePreference('inApp', type.id, e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                        <IconComponent className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiet Hours
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Disable notifications during specific hours
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quietHours.enabled}
              onChange={(e) => updatePreference('quietHours', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {preferences.quietHours.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quietHours.start}
                onChange={(e) => updatePreference('quietHours', 'start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quietHours.end}
                onChange={(e) => updatePreference('quietHours', 'end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Save Changes Footer */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800 shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                You have unsaved changes
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  disabled={updatePreferencesMutation.isPending}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updatePreferencesMutation.isPending}
                  className="inline-flex items-center px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationPreferences;