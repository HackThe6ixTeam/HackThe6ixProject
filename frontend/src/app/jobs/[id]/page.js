// src/app/job/[id]/page.js
import { notFound } from 'next/navigation';
import { getJobById } from '../../../lib/jobs'; // Adjust import path as needed

export default async function JobDetail({ params }) {
  const { id } = params;

  // Fetch job data from your API or database
  const job = await getJobById(id);

  if (!job) {
    // If no job found, return a 404 page
    notFound();
  }

  return (
    <div>
      <p>Job: {job.job}</p>
      <p>Status: {job.status}</p>
      {/* Add more job details here */}
    </div>
  );
}
