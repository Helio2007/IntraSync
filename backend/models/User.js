const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  checkInStatus: {
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date },
    checkOutTime: { type: Date }
  }
});

module.exports = mongoose.model('User', userSchema); 