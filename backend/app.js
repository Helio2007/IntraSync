const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const eventsRouter = require('./routes/events');
const authRouter = require('./routes/auth');
const checkinRouter = require('./routes/checkin');
const companyEventsRouter = require('./routes/companyEvents');

const app = express();

const MONGO_URI = 'mongodb+srv://kamikazi:gfipz4PcdRELa9Q0@cluster0.auxmzrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/api/events', eventsRouter);
app.use('/api/auth', authRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/company-events', companyEventsRouter);

module.exports = app; 