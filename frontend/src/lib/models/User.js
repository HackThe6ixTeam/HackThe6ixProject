// src/lib/models/User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  devpost: { type: String, required: true },
  github: { type: String, required: true },
  linkedin: { type: String, required: true },
  resumeFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
