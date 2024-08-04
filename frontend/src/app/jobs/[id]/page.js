"use client"; // Ensure this is at the top if you use client-side hooks

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../../lib/firebase'; // Update the path if necessary

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

// Calculate ATS score based on keywords and resume text
const calculateATSScore = (keywords, resumeText) => {
  const resumeTextLower = resumeText.toLowerCase();
  const matchedKeywordsCount = Object.keys(keywords).filter(keyword =>
    resumeTextLower.includes(keyword.toLowerCase())
  ).length;
  return matchedKeywordsCount * 10;
};

export default function JobDetail({ params }) {
  const { id } = params;
  const [job, setJob] = useState(null);
  const [selectedTab, setSelectedTab] = useState('description');
  const [applicantsDetails, setApplicantsDetails] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [resumeUrls, setResumeUrls] = useState({});

  useEffect(() => {
    if (selectedApplicant) {
      console.log(selectedApplicant._id);
      console.log(job._id);

      async function fetchData() {
        const processingResponse = await fetch('http://127.0.0.1:8000/spider-and-tech', {
          method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: selectedApplicant._id, job_id: job._id }),
        });

        if (!processingResponse.ok) {
            throw new Error('Failed to begin processing');
        }

        const processingData = await processingResponse.json();
        console.log('Processing data:', processingData);
      }

      fetchData();
    }
  }, [selectedApplicant]);

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

        // Fetch applicants details
        const applicantsData = await Promise.all(
          data.applicants.map(async (applicantId) => {
            const userData = await getUserById(applicantId);
            return userData;
          })
        );
        setApplicantsDetails(applicantsData);

        // Fetch resume URLs from Firebase Storage
        const resumeUrls = {};
        await Promise.all(applicantsData.map(async (applicant) => {
          const applicantId = applicant._id;
          const resumeRef = ref(storage, `${applicantId}.pdf`);
          try {
            const url = await getDownloadURL(resumeRef);
            resumeUrls[applicantId] = url;
          } catch (error) {
            console.error(`Failed to get URL for resume of ${applicantId}`, error);
          }
        }));
        setResumeUrls(resumeUrls);

        // Extract job keywords from the job data
        const jobKeywords = data.keywords.reduce((acc, keyword) => {
          acc[keyword] = 0; // Initialize keyword counts to 0
          return acc;
        }, {});

        // Set the job keywords for ATS scoring
        if (data.applicants.length > 0) {
          const resumeText = applicantsData[0].resumeText || ''; // Assuming we take the first applicant for ATS scoring
          const score = calculateATSScore(jobKeywords, resumeText);
          setAtsScore(score);
        }
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
  const radarData = Object.entries(job.keywords.reduce((acc, keyword) => {
    acc[keyword] = 0;
    return acc;
  }, {})).map(([key, value]) => ({
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
                    {resumeUrls[selectedApplicant._id] ? (
                      <iframe
                        src={resumeUrls[selectedApplicant._id]}
                        width="100%"
                        height="920px"
                        title="Resume"
                      ></iframe>
                    ) : (
                      <p>Loading resume...</p>
                    )}
                  </div>
                  <div className="w-1/2">
                    <div className="text-center mb-4">
                      <div className="inline-block border rounded p-4 m-2">
                        <h3 className="text-xl font-bold">{atsScore !== null ? `${atsScore}% ATS Match` : 'Calculating ATS Match...'}</h3>
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
