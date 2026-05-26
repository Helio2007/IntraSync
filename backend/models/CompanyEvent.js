const mongoose = require('mongoose');

const companyEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, default: '' },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanyEvent', companyEventSchema); 