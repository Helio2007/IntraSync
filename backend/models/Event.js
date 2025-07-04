const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true }, // e.g. '14:00'
  date: { type: String, required: true }, // e.g. '2024-06-26'
  type: { type: String, enum: ['meeting', 'task', 'break', 'checkin', 'checkout'], required: true },
  status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema); 