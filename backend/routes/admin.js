const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Use env in production

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
}

function computeWeeklyStats(user) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  let totalMinutes = 0;
  const daysPresentSet = new Set();

  if (user.checkInHistory && user.checkInHistory.length > 0) {
    user.checkInHistory.forEach(event => {
      if (!event.checkInTime) return;
      const inTime = new Date(event.checkInTime);
      if (inTime >= startOfWeek && event.checkOutTime) {
        const outTime = new Date(event.checkOutTime);
        const diffMinutes = Math.floor((outTime - inTime) / (1000 * 60));
        totalMinutes += diffMinutes;
        daysPresentSet.add(inTime.toDateString());
      }
    });
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hoursThisWeek: { hours, minutes },
    daysPresent: daysPresentSet.size,
    meetingsAttended: 0,
    tasksCompleted: 0,
  };
}

// List employees with status + weekly stats
router.get('/employees', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ name: 1 });
    const data = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      checkInStatus: u.checkInStatus,
      stats: computeWeeklyStats(u),
    }));
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

