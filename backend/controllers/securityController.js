// backend/controllers/securityController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

// @desc    Get user privacy settings
// @route   GET /api/security/privacy
// @access  Private
const getPrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('privacySettings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize privacy settings if not exists
    const defaultPrivacySettings = {
      search: {
        appearInSearch: true,
        showInDirectory: true
      },
      activity: {
        showOnlineStatus: true,
        showLastSeen: false
      }
    };

    const privacySettings = user.privacySettings || defaultPrivacySettings;
    res.json(privacySettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user privacy settings
// @route   PUT /api/security/privacy
// @access  Private
const updatePrivacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize privacy settings if not exists
    if (!user.privacySettings) {
      user.privacySettings = {
        search: {
          appearInSearch: true,
          showInDirectory: true
        },
        activity: {
          showOnlineStatus: true,
          showLastSeen: false
        }
      };
    }

    // Update only supported privacy settings
    if (req.body.search) {
      user.privacySettings.search = { 
        ...user.privacySettings.search, 
        ...req.body.search 
      };
    }
    if (req.body.activity) {
      user.privacySettings.activity = { 
        ...user.privacySettings.activity, 
        ...req.body.activity 
      };
    }

    await user.save();

    res.json({
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user security settings
// @route   GET /api/security/settings
// @access  Private
const getSecuritySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('securitySettings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize security settings if not exists
    if (!user.securitySettings) {
      user.securitySettings = {
        twoFactorEnabled: false,
        loginNotifications: true,
        unusualActivityAlerts: true
      };
      await user.save();
    }

    // Don't send sensitive data
    const securitySettings = {
      twoFactorEnabled: user.securitySettings.twoFactorEnabled || false,
      loginNotifications: user.securitySettings.loginNotifications || true,
      unusualActivityAlerts: user.securitySettings.unusualActivityAlerts || true,
      lastLoginAt: user.securitySettings.lastLoginAt,
      lastLoginIP: user.securitySettings.lastLoginIP
    };

    res.json(securitySettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user security settings
// @route   PUT /api/security/settings
// @access  Private
const updateSecuritySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { loginNotifications, unusualActivityAlerts } = req.body;

    if (loginNotifications !== undefined) {
      user.securitySettings.loginNotifications = loginNotifications;
    }
    if (unusualActivityAlerts !== undefined) {
      user.securitySettings.unusualActivityAlerts = unusualActivityAlerts;
    }

    await user.save();

    res.json({
      message: 'Security settings updated successfully',
      securitySettings: {
        twoFactorEnabled: user.securitySettings.twoFactorEnabled,
        loginNotifications: user.securitySettings.loginNotifications,
        unusualActivityAlerts: user.securitySettings.unusualActivityAlerts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/security/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Update password
    user.password = newPassword;
    user.securitySettings.passwordChangedAt = new Date();
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Setup 2FA
// @route   POST /api/security/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.securitySettings.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `FreelancePlatform (${user.email})`,
      issuer: 'FreelancePlatform'
    });

    // Store secret temporarily (not enabled yet)
    user.securitySettings.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/security/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Please provide verification token' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.securitySettings.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.securitySettings.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    // Enable 2FA
    user.securitySettings.twoFactorEnabled = true;
    user.securitySettings.backupCodes = backupCodes;
    await user.save();

    res.json({
      message: '2FA enabled successfully',
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/security/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const { password, token } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Please provide your password' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    if (!user.securitySettings.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify 2FA token if 2FA is enabled
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.securitySettings.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid 2FA token' });
      }
    }

    // Disable 2FA
    user.securitySettings.twoFactorEnabled = false;
    user.securitySettings.twoFactorSecret = undefined;
    user.securitySettings.backupCodes = [];
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Delete account
// @route   DELETE /api/security/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password, confirmText } = req.body;
    
    if (!password || confirmText !== 'DELETE') {
      return res.status(400).json({ 
        message: 'Please provide your password and type DELETE to confirm' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // TODO: Add cleanup logic for related data (jobs, messages, etc.)
    // For now, we'll just mark the account as inactive
    user.accountStatus.isActive = false;
    user.accountStatus.isSuspended = true;
    user.accountStatus.suspensionReason = 'Account deleted by user';
    
    await user.save();

    res.json({ message: 'Account has been deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to track login activity
const trackLoginActivity = async (userId, req) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Get IP address properly
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               req.ip ||
               '127.0.0.1';

    // Initialize security settings if not exists
    if (!user.securitySettings) {
      user.securitySettings = {
        twoFactorEnabled: false,
        loginNotifications: true,
        unusualActivityAlerts: true
      };
    }

    // Update security settings
    user.securitySettings.lastLoginAt = new Date();
    user.securitySettings.lastLoginIP = ip;

    await user.save();
  } catch (error) {
    console.error('Error tracking login activity:', error);
  }
};



module.exports = {
  getPrivacySettings,
  updatePrivacySettings,
  getSecuritySettings,
  updateSecuritySettings,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  deleteAccount,
  trackLoginActivity
};