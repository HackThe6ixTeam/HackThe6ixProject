import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

const repositorySchema = new mongoose.Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  job_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  repo_url: { type: String, default: '' },
  summary: { type: String, required: false },
  ind_file_summaries: [
    {
      filename: { type: String, required: false },
      summary: { type: String, required: false }
    }
  ],
  job_skills: [ // this is skills relevant to this job
    {
      name: { type: String, required: false },
      summary: { type: String, required: false },
      score: { type: Number, required: false }
    }
  ],
  tech_competence: { // tech competence of the user based off this repo, will avg later for overall score
    score: { type: Number, required: false },
    summary: { type: String, required: false }
  }
});

const Repository = mongoose.models.Repository || mongoose.model('Repository', repositorySchema);

export default Repository;