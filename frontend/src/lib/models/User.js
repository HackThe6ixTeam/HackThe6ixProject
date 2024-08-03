// src/lib/models/User.js

import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  devpost: { type: String, required: true },
  github: { type: String, required: true },
  github_token: { type: String, required: false },
  linkedin: { type: String, required: true },
  user: { type: Object, required: true },
  resumeText: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
