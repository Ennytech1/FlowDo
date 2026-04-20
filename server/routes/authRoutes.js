const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware');
const { sendWelcomeEmail } = require('../services/emailService');
const cloudinary = require('../services/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Setup Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'todo-champ-avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const JWT_SECRET = process.env.JWT_SECRET || 'flowdo_secret_key';

// Register
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    console.log(`📩 Signup attempt for: ${email}`);
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      password: hashedPassword,
      fullName,
    });

    await user.save();

    // Send Welcome Email (Non-blocking)
    sendWelcomeEmail(email, fullName);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Incorrect password for: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio; // Need to add bio to User model

    await user.save();
    res.json({ id: user._id, email: user.email, fullName: user.fullName, bio: user.bio });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change Password
router.patch('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload Avatar
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    console.log('📬 Avatar Upload Request received for User:', req.userId);
    
    if (!req.file) {
      console.error('❌ No file received in Multer');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('✅ File received from Multer:', req.file.path);
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatarUrl = req.file.path; // Cloudinary URL
    await user.save();
    
    console.log('✨ Avatar updated in Database for:', user.email);
    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error('💥 Avatar Upload Crash:', err);
    res.status(500).json({ message: 'Server error during upload: ' + err.message });
  }
});

module.exports = router;
