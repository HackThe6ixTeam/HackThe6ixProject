import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URI;
const dbName = 'your-database-name'; // Replace with your actual database name

let client;
let db;

async function connectToDatabase() {
  if (db) return { client, db };
  client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);
  return { client, db };
}

export async function GET(request) {
  const { db } = await connectToDatabase();
  const jobsCollection = db.collection('jobs');

  try {
    const jobs = await jobsCollection.find({}).toArray();
    return new Response(JSON.stringify(jobs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch jobs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  const { db } = await connectToDatabase();
  const jobsCollection = db.collection('jobs');

  try {
    const newJob = await request.json();
    const result = await jobsCollection.insertOne(newJob);
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to post job' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
