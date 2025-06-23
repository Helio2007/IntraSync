const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true }, // e.g. '14:00'
  type: { type: String, enum: ['meeting', 'task', 'break'], required: true },
  status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema); 