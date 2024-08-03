// src/app/job/[id]/page.js
"use client"; // Ensure this is at the top if you use client-side hooks

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';

const getUserById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/user/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch topic");
    }

    return res.json();
  } catch (error) {
    console.log(error);
  }
};

export default function JobDetail({ params }) {
  const { id } = params;
  console.log(id);
  const [job, setJob] = useState(null);
  const [selectedTab, setSelectedTab] = useState('description');

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const data = await response.json();
        console.log(data);
        setJob(data);

        const userData = await getUserById(data.applicants[0]);
        console.log(userData);
      } catch (error) {
        notFound();
      }
    }

    fetchJob();
  }, [id]);

  if (!job) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-6 md:p-8 lg:p-12"> {/* Increased padding */}
      {/* Job Title */}
      <h1 className="text-3xl font-bold mb-6"> {/* Increased font size */}
        {job.job}
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-6 mb-6"> {/* Increased space between tabs */}
        <button
          className={`py-3 px-6 border-b-4 ${selectedTab === 'description' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
          onClick={() => setSelectedTab('description')}
        >
          Description
        </button>
        <button
          className={`py-3 px-6 border-b-4 ${selectedTab === 'applicants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
          onClick={() => setSelectedTab('applicants')}
        >
          Applicants
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'description' && (
        <div className="mt-4">
          <p>{job.description || 'No description available.'}</p>
        </div>
      )}
      {selectedTab === 'applicants' && (
        <div className="mt-4">
          {job.applicants && job.applicants.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compatibility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {job.applicants.map((applicant, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{applicant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.compatibility}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.submitted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No applicants listed.</p>
          )}
        </div>
      )}
    </div>
  );
}
