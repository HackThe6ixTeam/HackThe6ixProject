// src/lib/mongodb.js

import mongoose from 'mongoose';

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const dbUri = process.env.MONGODB_URI; // Ensure this is set correctly

  await mongoose.connect(dbUri);
  return mongoose.connection;
};

export default connectToDatabase;
