// src/lib/models/Job.js

import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

const jobSchema = new mongoose.Schema({
  job: { type: String, required: true },
  type: { type: String, required: true },
  created: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: [String], required: true },
  applicants: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  status: { type: String, required: true },
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export default Job;
