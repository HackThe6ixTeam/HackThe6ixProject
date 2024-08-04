// src/app/api/jobs/update-applicant/route.js

import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export async function POST(req) {
  const { jobId, applicantId, action } = await req.json();

  if (!jobId || !applicantId || !action) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
  }

  try {
    await client.connect();
    const db = client.db('Hackthe6ix');
    const jobsCollection = db.collection('jobs');

    const update = { $pull: { applicants: applicantId } };

    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(jobId) },
      update
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Applicant updated successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    await client.close();
  }
}
