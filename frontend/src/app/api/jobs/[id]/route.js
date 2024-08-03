// src/app/api/jobs/[id]/route.js
export async function GET(req, { params }) {
    const { id } = params;
  
    try {
      // Replace with your actual data fetching logic
      const job = await fetchJobById(id); // Assume fetchJobById is a function to get job data
      if (job) {
        return new Response(JSON.stringify(job), { status: 200 });
      } else {
        return new Response(JSON.stringify({ message: 'Job not found' }), { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }
  
  async function fetchJobById(id) {
    // Mock job data - replace this with real data fetching
    const jobs = [
          {
            id: 'b1e8f4e0-0b2c-4f2d-a0d4-9d4d9d62dfbb',
            job: 'Software Engineer',
            type: 'FULL_TIME',
            created: '2024-01-15',
            location: 'Toronto',
            applicants: 123,
            status: 'open',
          },
          {
            id: 'f9aebd89-dae4-4c3e-9e5b-4e10a71a2487',
            job: 'Data Scientist',
            type: 'FULL_TIME',
            created: '2024-02-20',
            location: 'Vancouver',
            applicants: 87,
            status: 'in_review',
          },
          {
            id: 'c6d7485e-9c3d-4c0a-a27f-15b8c8b134ed',
            job: 'Product Manager',
            type: 'PART_TIME',
            created: '2024-03-05',
            location: 'Montreal',
            applicants: 56,
            status: 'closed',
          },
          {
            id: '8f6a7f8d-d5e9-4a95-9d58-2bfb2f7d23ed',
            job: 'UX Designer',
            type: 'FULL_TIME',
            created: '2024-04-12',
            location: 'Calgary',
            applicants: 174,
            status: 'open',
          },
          {
            id: 'af5c9824-4f6c-4b6b-9100-36d6d8c8b89e',
            job: 'Marketing Specialist',
            type: 'INTERNSHIP',
            created: '2024-05-18',
            location: 'Ottawa',
            applicants: 92,
            status: 'in_review',
          },
          {
            id: '2b00a4d5-85d7-4d8f-9a87-3eacbc60d441',
            job: 'DevOps Engineer',
            type: 'FULL_TIME',
            created: '2024-06-22',
            location: 'Toronto',
            applicants: 139,
            status: 'open',
          },
          {
            id: '5a1e6f2b-8293-4f57-a9c0-22e3e0b6c8a1',
            job: 'Cybersecurity Analyst',
            type: 'PART_TIME',
            created: '2024-07-30',
            location: 'Vancouver',
            applicants: 65,
            status: 'closed',
          }
      // Add more job objects as needed
    ];
    return jobs.find((job) => job.id === id);
  }
  