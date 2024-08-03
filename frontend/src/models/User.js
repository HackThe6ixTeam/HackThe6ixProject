// models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  // Define other fields as needed
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
