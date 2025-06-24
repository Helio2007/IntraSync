const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret'; // Use env var in production

// Auth middleware
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Get current check-in status
router.get('/status', auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.checkInStatus);
});

// Check in
router.post('/in', auth, async (req, res) => {
  console.log('Check-in request for user:', req.user.userId);
  const user = await User.findById(req.user.userId);
  if (!user) {
    console.log('Check-in: user not found');
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.checkInStatus.checkedIn) {
    console.log('Check-in: already checked in');
    return res.status(400).json({ message: 'Already checked in' });
  }
  user.checkInStatus.checkedIn = true;
  user.checkInStatus.checkInTime = new Date();
  user.checkInStatus.checkOutTime = null;
  await user.save();
  console.log('Check-in success for user:', user.email, user.checkInStatus);
  res.json(user.checkInStatus);
});

// Check out
router.post('/out', auth, async (req, res) => {
  console.log('Check-out request for user:', req.user.userId);
  const user = await User.findById(req.user.userId);
  if (!user) {
    console.log('Check-out: user not found');
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.checkInStatus.checkedIn) {
    console.log('Check-out: not checked in');
    return res.status(400).json({ message: 'Not checked in' });
  }
  user.checkInStatus.checkedIn = false;
  user.checkInStatus.checkOutTime = new Date();
  // keep checkInTime as is
  await user.save();
  console.log('Check-out success for user:', user.email, user.checkInStatus);
  res.json(user.checkInStatus);
});

module.exports = router; 