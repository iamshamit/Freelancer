// backend/controllers/userController.js
const { User } = require('../models');
const { generateToken } = require('../config/jwt');
const { trackLoginActivity } = require('./securityController');
const axios = require('axios');

// Helper function to upload image to ImgBB
const uploadImageToImgBB = async (imageData) => {
  try {
    // Extract base64 data if it's a complete data URL
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    // Create form data for ImgBB API
    const formData = new FormData();
    formData.append('image', base64Data);
    
    // Make API request to ImgBB
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData
    );
    
    if (response.data.success) {
      return response.data.data.url;
    }
    return null;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills, profilePicture } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with all provided data
    const userData = {
      name,
      email,
      password,
      role
    };

    // Add optional fields if provided
    if (bio) userData.bio = bio;
    if (skills && skills.length > 0) userData.skills = skills;
    
    // Handle profile picture upload if provided
    if (profilePicture) {
      try {
        const imageUrl = await uploadImageToImgBB(profilePicture);
        if (imageUrl) {
          userData.profilePicture = imageUrl;
        }
      } catch (imgError) {
        console.error('Failed to upload profile picture:', imgError);
        // Continue with registration even if image upload fails
      }
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if 2FA is enabled
    if (user.securitySettings?.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ 
          requiresTwoFactor: true,
          message: 'Two-factor authentication code required' 
        });
      }

      // Verify 2FA code
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: user.securitySettings.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ message: 'Invalid two-factor authentication code' });
      }
    }

    // Track login activity
    await trackLoginActivity(user._id, req);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      profilePicture: user.profilePicture,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: 'Please provide an image' });
    }

    // Use the helper function to upload to ImgBB
    const imageUrl = await uploadImageToImgBB(image);
    
    if (imageUrl) {
      const user = await User.findById(req.user._id);
      
      if (user) {
        user.profilePicture = imageUrl;
        await user.save();
        
        res.json({
          message: 'Profile picture updated',
          profilePicture: imageUrl
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(400).json({ message: 'Image upload failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rest of the controller functions remain the same...
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio || user.bio;
      
      if (req.body.skills) {
        user.skills = req.body.skills;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'ratings.from',
        select: 'name profilePicture'
      });
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getUserById
};