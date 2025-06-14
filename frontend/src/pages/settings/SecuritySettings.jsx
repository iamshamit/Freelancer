// src/pages/settings/SecuritySettings.jsx
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock,
  Key,
  Smartphone,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Globe,
  Bell,
  CheckCircle,
  XCircle,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import SettingsLayout from '../../components/layout/SettingsLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SecuritySettings = ({ darkMode, toggleDarkMode }) => {
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [twoFACode, setTwoFACode] = useState('');
  
  // Fetch security settings
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: () => api.security.getSecuritySettings()
  });
  

  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData) => api.security.changePassword(passwordData),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });
  
  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: (settings) => api.security.updateSecuritySettings(settings),
    onSuccess: () => {
      toast.success('Security settings updated');
      queryClient.invalidateQueries(['security-settings']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  });
  
  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: () => api.security.setup2FA(),
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setManualKey(data.manualEntryKey);
      setShow2FAModal(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA');
    }
  });
  
  // Verify 2FA mutation
  const verify2FAMutation = useMutation({
    mutationFn: (token) => api.security.verify2FA(token),
    onSuccess: (data) => {
      toast.success('2FA enabled successfully');
      setBackupCodes(data.backupCodes);
      setShow2FAModal(false);
      setTwoFACode('');
      queryClient.invalidateQueries(['security-settings']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    }
  });
  
  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: (data) => api.security.disable2FA(data),
    onSuccess: () => {
      toast.success('2FA disabled successfully');
      queryClient.invalidateQueries(['security-settings']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  });
  

  
  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };
  
  const handleSecurityToggle = (setting, value) => {
    updateSecurityMutation.mutate({ [setting]: value });
  };
  
  const handleSetup2FA = () => {
    setup2FAMutation.mutate();
  };
  
  const handleVerify2FA = () => {
    if (!twoFACode || twoFACode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    verify2FAMutation.mutate(twoFACode);
  };
  
  const handleDisable2FA = () => {
    const password = prompt('Please enter your password to disable 2FA:');
    if (password) {
      disable2FAMutation.mutate({ password });
    }
  };
  
  const copyBackupCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Backup code copied to clipboard');
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
  
  const tabs = [
    { id: 'password', name: 'Password', icon: Lock },
    { id: '2fa', name: 'Two-Factor Auth', icon: Smartphone }
  ];
  
  return (
    <SettingsLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Security Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account security and authentication settings
          </p>
        </div>
        
        {/* Security Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      isActive
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Score */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Security Overview
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                      securitySettings?.twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Smartphone className={`h-8 w-8 ${
                        securitySettings?.twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
                    <p className={`text-sm mt-1 ${
                      securitySettings?.twoFactorEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                    }`}>
                      {securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                      <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">Login Alerts</p>
                    <p className={`text-sm mt-1 ${
                      securitySettings?.loginNotifications ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                    }`}>
                      {securitySettings?.loginNotifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  

                </div>
              </div>
              
              {/* Quick Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Security Preferences
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Login Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified when someone logs into your account
                      </p>
                    </div>
                    <button
                      onClick={() => handleSecurityToggle('loginNotifications', !securitySettings?.loginNotifications)}
                      disabled={updateSecurityMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        securitySettings?.loginNotifications ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings?.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Unusual Activity Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get alerts for suspicious account activity
                      </p>
                    </div>
                    <button
                      onClick={() => handleSecurityToggle('unusualActivityAlerts', !securitySettings?.unusualActivityAlerts)}
                      disabled={updateSecurityMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        securitySettings?.unusualActivityAlerts ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securitySettings?.unusualActivityAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'password' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  loading={changePasswordMutation.isPending}
                  icon={<Save className="h-4 w-4" />}
                >
                  Change Password
                </Button>
              </form>
            </div>
          )}
          
          {activeTab === '2fa' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Two-Factor Authentication
              </h3>
              
              {securitySettings?.twoFactorEnabled ? (
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">
                        Two-Factor Authentication is enabled
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Your account is protected with 2FA
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="danger"
                    onClick={handleDisable2FA}
                    loading={disable2FAMutation.isPending}
                    icon={<XCircle className="h-4 w-4" />}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-300">
                        Two-Factor Authentication is disabled
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Enable 2FA to add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400">
                      Two-factor authentication adds an extra layer of security to your account. 
                      You'll need your password and a verification code from your phone to sign in.
                    </p>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={handleSetup2FA}
                    loading={setup2FAMutation.isPending}
                    icon={<Key className="h-4 w-4" />}
                  >
                    Enable 2FA
                  </Button>
                </div>
              )}
            </div>
          )}
          

        </motion.div>
        
        {/* 2FA Setup Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Setup Two-Factor Authentication
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  {qrCode && (
                    <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Scan this QR code with your authenticator app or enter the manual key:
                  </p>
                  
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    <code className="text-sm font-mono">{manualKey}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(manualKey);
                        toast.success('Manual key copied');
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter verification code
                  </label>
                  <input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-mono text-lg"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShow2FAModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleVerify2FA}
                    loading={verify2FAMutation.isPending}
                    className="flex-1"
                  >
                    Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Backup Codes Modal */}
        {backupCodes.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Backup Codes
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded"
                    >
                      <code className="text-sm font-mono">{code}</code>
                      <button
                        onClick={() => copyBackupCode(code)}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="primary"
                  onClick={() => setBackupCodes([])}
                  className="w-full"
                >
                  I've saved my backup codes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default SecuritySettings;