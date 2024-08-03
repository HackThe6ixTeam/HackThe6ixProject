// src/lib/jobs.js
export async function getJobById(id) {
    // Replace with your actual data fetching logic
    const response = await fetch(`http://localhost:3000/api/jobs/${id}`);
    if (!response.ok) {
      return null; // or throw an error if preferred
    }
    const job = await response.json();
    return job;
  }
  