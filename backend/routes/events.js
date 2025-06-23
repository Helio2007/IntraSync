const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events - get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ time: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events - create event
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/events/:id - update event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/events/:id - delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 