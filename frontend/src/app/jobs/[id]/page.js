"use client"; // Ensure this is at the top if you use client-side hooks

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';

const getUserById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/user/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }

    return res.json();
  } catch (error) {
    console.log(error);
    return {}; // Return an empty object in case of error
  }
};

export default function JobDetail({ params }) {
  const { id } = params;
  const [job, setJob] = useState(null);
  const [selectedTab, setSelectedTab] = useState('description');
  const [applicantsDetails, setApplicantsDetails] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Define gitData
  const gitData = {
    skills: {
      Python: 2,
      Java: 4,
      SQL: 6,
    },
    summary: "Experienced in backend development using Python, Java, and SQL.",
  };

  // Define job keywords and initialize counts
  const jobKeywords = {
    Python: 0,
    Java: 0,
    SQL: 0,
    JavaScript: 0,
    HTML: 0,
    CSS: 0,
    React: 0,
    Node: 0,
    MongoDB: 0,
    Docker: 0,
  };

  // Replace counts in jobKeywords with those in gitData where they match
  Object.keys(gitData.skills).forEach(skill => {
    if (jobKeywords.hasOwnProperty(skill)) {
      jobKeywords[skill] = gitData.skills[skill];
    }
  });

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const data = await response.json();
        setJob(data);

        const applicantsData = await Promise.all(
          data.applicants.map(async (applicantId) => {
            const userData = await getUserById(applicantId);
            return userData;
          })
        );
        setApplicantsDetails(applicantsData);
      } catch (error) {
        notFound();
      }
    }

    fetchJob();
  }, [id]);

  if (!job) {
    return <p className="p-4">Loading...</p>;
  }

  const handleAccept = async (applicant) => {
    try {
      const response = await fetch('/api/jobs/update-applicant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          applicantId: applicant._id,
          action: 'accept',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Accepted: ${applicant.user.name}`);
        setApplicantsDetails((prevDetails) =>
          prevDetails.filter((app) => app._id !== applicant._id)
        );
        setSelectedApplicant(null);
      } else {
        console.error(data.error || 'Error accepting applicant');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async (applicant) => {
    try {
      const response = await fetch('/api/jobs/update-applicant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          applicantId: applicant._id,
          action: 'reject',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Rejected: ${applicant.user.name}`);
        setApplicantsDetails((prevDetails) =>
          prevDetails.filter((app) => app._id !== applicant._id)
        );
        setSelectedApplicant(null);
      } else {
        console.error(data.error || 'Error rejecting applicant');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Prepare data for the radar chart
  const radarData = Object.entries(jobKeywords).map(([key, value]) => ({
    skill: key,
    level: value,
  }));

  return (
    <div className="p-6 md:p-8 lg:p-12">
      <h1 className="text-3xl font-bold mb-6">{job.job}</h1>
      <div className="flex space-x-6 mb-6">
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

      {selectedTab === 'description' && (
        <div className="mt-4">
          <p>{job.description || 'No description available.'}</p>
        </div>
      )}
      {selectedTab === 'applicants' && (
        <div className="mt-4">
          {selectedApplicant ? (
            <div>
              <button onClick={() => setSelectedApplicant(null)} className="mb-4 p-2 bg-red-500 text-white rounded">X</button>
              <div>
                <h2 className="text-4xl font-bold mb-4 text-center">{selectedApplicant.user.name}</h2>
                <div className="flex justify-center space-x-4 mb-8">
                  <button
                    onClick={() => handleAccept(selectedApplicant)}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(selectedApplicant)}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
                <div className="flex space-x-6">
                  <div className="w-1/2">
                    <iframe
                      src={`/Resume.pdf`}
                      width="100%"
                      height="920px"
                      title="Resume"
                    ></iframe>
                  </div>
                  <div className="w-1/2">
                  <div className="text-center mb-4">
  <div className="inline-block border rounded p-4 m-2">
    <h3 className="text-xl font-bold">50% ATS Match</h3>
  </div>
  <div className="inline-block border rounded p-4 m-2">
    <h3 className="text-xl font-bold">40% Verified Data</h3>
  </div>
</div>

                    <div className="flex justify-center">
                      <RadarChart outerRadius={150} width={600} height={600} data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar name="Job Skills" dataKey="level" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {applicantsDetails && applicantsDetails.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Github</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devpost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applicantsDetails.map((applicant, index) => (
                      <tr key={index} className="cursor-pointer" onClick={() => setSelectedApplicant(applicant)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{applicant.user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.github || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.devpost}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{applicant.linkedin}</td>
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
      )}
    </div>
  );
}
