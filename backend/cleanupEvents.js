const mongoose = require('mongoose');
const Event = require('./models/Event');

// TODO: Replace with your actual MongoDB connection string if different
const MONGO_URI = 'mongodb://localhost:27017/intrasync';

async function cleanup() {
  await mongoose.connect(MONGO_URI);

  const result = await Event.deleteMany({
    $or: [
      { date: { $exists: false } },
      { date: "" }
    ]
  });

  console.log(`Deleted ${result.deletedCount} events without a valid date.`);
  await mongoose.disconnect();
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
}); 