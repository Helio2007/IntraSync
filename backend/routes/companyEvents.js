const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CompanyEvent = require('../models/CompanyEvent');
const User = require('../models/User');

const JWT_SECRET = 'your_jwt_secret'; // Use env in production

// Middleware to check JWT and attach user
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET all company events (any logged-in user)
router.get('/', auth, async (req, res) => {
  try {
    const events = await CompanyEvent.find().sort({ time: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create company event (admin/ceo only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { title, date, time, type } = req.body;
  if (!title || !date || !time || !type) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const event = new CompanyEvent({
      title,
      date,
      time,
      type,
      createdBy: req.user.userId
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update company event (admin/ceo only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    const updatedEvent = await CompanyEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE company event (admin/ceo only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    const deletedEvent = await CompanyEvent.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 