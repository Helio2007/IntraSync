const express = require('express');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
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

router.get('/', auth, async (req, res) => {
  try {
    const items = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/read/:id', auth, async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch {
    res.status(400).json({ message: 'Bad request' });
  }
});

router.post('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Broadcast message to all users (admin/ceo only)
router.post('/broadcast', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { title, message, type = 'info', meta = {} } = req.body || {};
  if (!title || !message) return res.status(400).json({ message: 'Missing fields' });

  try {
    const users = await User.find({}, { _id: 1 });
    const docs = users.map(u => ({
      userId: u._id,
      title,
      message,
      type,
      meta,
    }));
    const inserted = await Notification.insertMany(docs);
    res.status(201).json({ created: inserted.length });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

