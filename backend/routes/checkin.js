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
  const now = new Date();
  user.checkInStatus.checkedIn = true;
  user.checkInStatus.checkInTime = now;
  user.checkInStatus.checkOutTime = null;
  // Add new check-in event to history
  user.checkInHistory.push({ checkInTime: now });
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
  const now = new Date();
  user.checkInStatus.checkedIn = false;
  user.checkInStatus.checkOutTime = now;
  // Update last check-in event in history with checkOutTime
  if (user.checkInHistory && user.checkInHistory.length > 0) {
    const last = user.checkInHistory[user.checkInHistory.length - 1];
    if (!last.checkOutTime) {
      last.checkOutTime = now;
      user.markModified('checkInHistory'); // Ensure Mongoose saves the update
    }
  }
  await user.save();
  console.log('Check-out success for user:', user.email, user.checkInStatus);
  res.json(user.checkInStatus);
});

// Get work statistics for the logged-in user
router.get('/stats', auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const now = new Date();
  // Get start of week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  let totalMinutes = 0;
  let daysPresentSet = new Set();
  if (user.checkInHistory && user.checkInHistory.length > 0) {
    user.checkInHistory.forEach(event => {
      if (!event.checkInTime) return;
      const inTime = new Date(event.checkInTime);
      if (inTime >= startOfWeek) {
        // Only count if checked out
        if (event.checkOutTime) {
          const outTime = new Date(event.checkOutTime);
          const diffMinutes = Math.floor((outTime - inTime) / (1000 * 60));
          totalMinutes += diffMinutes;
          daysPresentSet.add(inTime.toDateString());
        }
      }
    });
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  res.json({
    hoursThisWeek: { hours, minutes },
    daysPresent: daysPresentSet.size,
    meetingsAttended: 0, // Placeholder
    tasksCompleted: 0    // Placeholder
  });
});

module.exports = router; 