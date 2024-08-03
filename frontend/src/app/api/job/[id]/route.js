// src/app/api/job/[id]/route.js

import Job from '../../../../lib/models/Job'; // Adjust path as necessary

export async function GET(req, { params }) {
    const { id } = params;
  
    try {
        const job = await Job.findById(id).populate('applicants'); // Fetch job data with applicants
        if (job) {
            // Convert applicants to include only ids for demonstration purposes
            job.applicants = job.applicants.map(applicant => applicant._id);
            return new Response(JSON.stringify(job), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: 'Job not found' }), { status: 404 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
