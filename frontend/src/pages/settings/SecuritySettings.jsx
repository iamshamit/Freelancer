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
  Copy,
  Download,
  Files,
  RefreshCw
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
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [showViewBackupCodesModal, setShowViewBackupCodesModal] = useState(false);
  const [showRegenerateBackupCodesModal, setShowRegenerateBackupCodesModal] = useState(false);
  const [showViewPassword, setShowViewPassword] = useState(false);
  const [showRegeneratePassword, setShowRegeneratePassword] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [viewedBackupCodes, setViewedBackupCodes] = useState([]);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [twoFACode, setTwoFACode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [viewPassword, setViewPassword] = useState('');
  const [regeneratePassword, setRegeneratePassword] = useState('');
  
  // Fetch security settings
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: () => api.security.getSecuritySettings()
  });

  // Fetch backup codes count
  const { data: backupCodesCount } = useQuery({
    queryKey: ['backup-codes-count'],
    queryFn: () => api.security.getBackupCodesCount(),
    enabled: securitySettings?.twoFactorEnabled
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
      queryClient.invalidateQueries(['backup-codes-count']);
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
      setShowDisable2FAModal(false);
      setDisablePassword('');
      queryClient.invalidateQueries(['security-settings']);
      queryClient.invalidateQueries(['backup-codes-count']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  });

  // View backup codes mutation
  const viewBackupCodesMutation = useMutation({
    mutationFn: (password) => api.security.viewBackupCodes(password),
    onSuccess: (data) => {
      setViewedBackupCodes(data.backupCodes);
      setViewPassword('');
      setShowViewPassword(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to view backup codes');
    }
  });

  // Regenerate backup codes mutation
  const regenerateBackupCodesMutation = useMutation({
    mutationFn: (password) => api.security.regenerateBackupCodes(password),
    onSuccess: (data) => {
      toast.success('Backup codes regenerated successfully');
      setBackupCodes(data.backupCodes);
      setShowRegenerateBackupCodesModal(false);
      setRegeneratePassword('');
      setShowRegeneratePassword(false);
      queryClient.invalidateQueries(['backup-codes-count']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to regenerate backup codes');
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
    setShowDisable2FAModal(true);
  };
  
  const handleConfirmDisable2FA = () => {
    if (!disablePassword.trim()) {
      toast.error('Please enter your password');
      return;
    }
    
    disable2FAMutation.mutate({ password: disablePassword });
  };

  const handleViewBackupCodes = () => {
    setShowViewBackupCodesModal(true);
  };

  const handleConfirmViewBackupCodes = () => {
    if (!viewPassword.trim()) {
      toast.error('Please enter your password');
      return;
    }
    
    viewBackupCodesMutation.mutate(viewPassword);
  };

  const handleRegenerateBackupCodes = () => {
    setShowRegenerateBackupCodesModal(true);
  };

  const handleConfirmRegenerateBackupCodes = () => {
    if (!regeneratePassword.trim()) {
      toast.error('Please enter your password');
      return;
    }
    
    regenerateBackupCodesMutation.mutate(regeneratePassword);
  };
  
  // Close modal handlers
  const handleClose2FAModal = () => {
    setShow2FAModal(false);
    setTwoFACode('');
    setQrCode('');
    setManualKey('');
  };
  
  const handleCloseDisable2FAModal = () => {
    setShowDisable2FAModal(false);
    setDisablePassword('');
    setShowDisablePassword(false);
  };

  const handleCloseViewBackupCodesModal = () => {
    setShowViewBackupCodesModal(false);
    setViewPassword('');
    setShowViewPassword(false);
    setViewedBackupCodes([]);
  };

  const handleCloseRegenerateBackupCodesModal = () => {
    setShowRegenerateBackupCodesModal(false);
    setRegeneratePassword('');
    setShowRegeneratePassword(false);
  };
  
  const handleCloseBackupCodesModal = () => {
    setBackupCodes([]);
  };
  
  // Backdrop click handlers
  const handleBackdropClick = (e, closeHandler) => {
    if (e.target === e.currentTarget) {
      closeHandler();
    }
  };
  
  const copyBackupCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Backup code copied to clipboard');
  };

  // Copy all backup codes at once
  const copyAllBackupCodes = (codes = backupCodes) => {
    const allCodes = codes.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast.success('All backup codes copied to clipboard');
  };

  // Download backup codes as text file
  const downloadBackupCodes = (codes = backupCodes, isRegenerated = false) => {
    const content = `Two-Factor Authentication Backup Codes\n\nGenerated on: ${new Date().toLocaleDateString()}\n${isRegenerated ? 'Regenerated on: ' + new Date().toLocaleDateString() + '\n' : ''}\nBackup Codes:\n${codes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nImportant:\n- Keep these codes in a safe place\n- Each code can only be used once\n- Use these codes if you lose access to your authenticator app\n- Do not share these codes with anyone`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded successfully');
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

                  {/* Backup Codes Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Backup Codes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {backupCodesCount?.count || 0} backup codes remaining
                        </p>
                      </div>
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleViewBackupCodes}
                        icon={<Eye className="h-4 w-4" />}
                        className="flex-1"
                      >
                        View Codes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRegenerateBackupCodes}
                        icon={<RefreshCw className="h-4 w-4" />}
                        className="flex-1"
                      >
                        Regenerate
                      </Button>
                    </div>
                    
                    {backupCodesCount?.count <= 2 && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800 dark:text-yellow-300">Low backup codes</p>
                            <p className="text-yellow-700 dark:text-yellow-400">
                              You have {backupCodesCount?.count || 0} backup codes remaining. Consider regenerating new ones.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="danger"
                    onClick={handleDisable2FA}
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
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => handleBackdropClick(e, handleClose2FAModal)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
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
                  
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <code className="text-sm font-mono break-all mr-2 flex-1">{manualKey}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(manualKey);
                        toast.success('Manual key copied');
                      }}
                      className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex-shrink-0"
                      title="Copy manual key"
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
                    onClick={handleClose2FAModal}
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
            </motion.div>
          </div>
        )}
        
        {/* Disable 2FA Modal */}
        {showDisable2FAModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => handleBackdropClick(e, handleCloseDisable2FAModal)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Disable Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will reduce the security of your account. Are you sure you want to continue?
                </p>
              </div>
              
              {/* Warning Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-300 mb-1">
                      Security Warning
                    </p>
                    <p className="text-red-700 dark:text-red-400">
                      Disabling 2FA will make your account more vulnerable to unauthorized access. 
                      Only proceed if you understand the risks.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm your password to disable 2FA
                  </label>
                  <div className="relative">
                    <input
                      type={showDisablePassword ? 'text' : 'password'}
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowDisablePassword(!showDisablePassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showDisablePassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseDisable2FAModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleConfirmDisable2FA}
                    loading={disable2FAMutation.isPending}
                    disabled={!disablePassword.trim()}
                    className="flex-1"
                    icon={<XCircle className="h-4 w-4" />}
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Backup Codes Modal */}
        {showViewBackupCodesModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => handleBackdropClick(e, handleCloseViewBackupCodesModal)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {viewedBackupCodes.length > 0 ? (
                // Show backup codes
                <>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Your Backup Codes
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Here are your remaining backup codes. Keep them safe and secure.
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant="outline"
                        onClick={() => copyAllBackupCodes(viewedBackupCodes)}
                        icon={<Files className="h-4 w-4" />}
                        className="flex-1 text-sm"
                      >
                        Copy All
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadBackupCodes(viewedBackupCodes)}
                        icon={<Download className="h-4 w-4" />}
                        className="flex-1 text-sm"
                      >
                        Download
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {viewedBackupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0">
                              {(index + 1).toString().padStart(2, '0')}.
                            </span>
                            <code className="text-sm font-mono break-all">{code}</code>
                          </div>
                          <button
                            onClick={() => copyBackupCode(code)}
                            className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex-shrink-0"
                            title="Copy this code"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start">
                        <Shield className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          <p className="font-medium mb-1">Remember:</p>
                          <p>Each code can only be used once. Store them in a secure location and don't share them with anyone.</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      onClick={handleCloseViewBackupCodesModal}
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                // Password verification form
                <>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    View Backup Codes
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For security reasons, please enter your password to view your backup codes.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showViewPassword ? 'text' : 'password'}
                          value={viewPassword}
                          onChange={(e) => setViewPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowViewPassword(!showViewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showViewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={handleCloseViewBackupCodesModal}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleConfirmViewBackupCodes}
                        loading={viewBackupCodesMutation.isPending}
                        disabled={!viewPassword.trim()}
                        className="flex-1"
                        icon={<Eye className="h-4 w-4" />}
                      >
                        View Codes
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Regenerate Backup Codes Modal */}
        {showRegenerateBackupCodesModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => handleBackdropClick(e, handleCloseRegenerateBackupCodesModal)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Regenerate Backup Codes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will invalidate all your current backup codes and generate new ones.
                </p>
              </div>
              
              {/* Warning Message */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-300 mb-1">
                      Important Notice
                    </p>
                    <p className="text-orange-700 dark:text-orange-400">
                      All your current backup codes will be permanently invalidated. Make sure to save the new codes securely.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm your password to regenerate backup codes
                  </label>
                  <div className="relative">
                    <input
                      type={showRegeneratePassword ? 'text' : 'password'}
                      value={regeneratePassword}
                      onChange={(e) => setRegeneratePassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegeneratePassword(!showRegeneratePassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showRegeneratePassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseRegenerateBackupCodesModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmRegenerateBackupCodes}
                    loading={regenerateBackupCodesMutation.isPending}
                    disabled={!regeneratePassword.trim()}
                    className="flex-1"
                    icon={<RefreshCw className="h-4 w-4" />}
                  >
                    Regenerate Codes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Backup Codes Display Modal (for both initial setup and regeneration) */}
        {backupCodes.length > 0 && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => handleBackdropClick(e, handleCloseBackupCodesModal)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Backup Codes
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                
                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => copyAllBackupCodes(backupCodes)}
                    icon={<Files className="h-4 w-4" />}
                    className="flex-1 text-sm"
                  >
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadBackupCodes(backupCodes, true)}
                    icon={<Download className="h-4 w-4" />}
                    className="flex-1 text-sm"
                  >
                    Download
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0">
                          {(index + 1).toString().padStart(2, '0')}.
                        </span>
                        <code className="text-sm font-mono break-all">{code}</code>
                      </div>
                      <button
                        onClick={() => copyBackupCode(code)}
                        className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex-shrink-0"
                        title="Copy this code"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium mb-1">Important:</p>
                      <p>Each backup code can only be used once. Store them securely and don't share them with anyone.</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  onClick={handleCloseBackupCodesModal}
                  className="w-full"
                >
                  I've saved my backup codes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default SecuritySettings;