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
  const [techCompetency, setTechCompetency] = useState(null);
  const [verifiedPercentage, setVerifiedPercentage] = useState(null);
  const [jobCompatibility, setJobCompatibility] = useState(null);
  const [resumeUrls, setResumeUrls] = useState({});
  const [processingData, setProcessingData] = useState(null);

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
        setProcessingData(processingData);
        setTechCompetency(processingData.average_tech_competence * 100);
      }

      fetchData();


      async function fetchVerifiedPercentage() {
        const processingResponse = await fetch('http://127.0.0.1:8000/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: selectedApplicant.resumeText }),
        });

        if (!processingResponse.ok) {
          throw new Error('Failed to begin processing');
        }

        const processingData = await processingResponse.json();
        console.log('verified data:', processingData);
        setVerifiedPercentage(processingData);
      }

      fetchVerifiedPercentage();
      
      async function fetchJobCompatibility() {
        const processingResponse = await fetch('http://127.0.0.1:8000/resume-job-match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ job_id: job._id, resume: selectedApplicant.resumeText }),
        });

        if (!processingResponse.ok) {
          throw new Error('Failed to begin processing');
        }

        const processingData = await processingResponse.json();
        console.log('job compatibility:', processingData);
        setJobCompatibility(processingData);
      }

      fetchJobCompatibility();
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
  const radarData = processingData
    ? Object.entries(processingData.average_skill_scores).map(([key, value]) => ({
        skill: key,
        level: value * 10,
      }))
    : [];

  return (
    <div className="p-6 md:p-8 lg:p-12 flex justify-center">
      <div className="w-full max-w-4xl">
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
      )}
      {selectedTab === 'applicants' && (
        <div className="mt-4">
          {selectedApplicant && (
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
                        <h3 className="text-xl font-bold">{techCompetency !== null ? `${techCompetency}% Tech Competency` : 'Calculating Tech Competency...'}</h3>
                      </div>
                      <div className="inline-block border rounded p-4 m-2">
                        <h3 className="text-xl font-bold">{verifiedPercentage.match_percentage !== null ? `${verifiedPercentage.match_percentage}% Verified Data` : 'Calculating Verified Data...'}</h3>
                      </div>
                      <div className="inline-block border rounded p-4 m-2">
                        <h3 className="text-xl font-bold">{jobCompatibility.relevance_score !== null ? `${jobCompatibility.relevance_score}% Skill Compatibility` : 'Skill Compatibility...'}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {selectedTab === 'description' && (
          <div className="mt-4">
            <p>
              MongoDB is at the forefront of transforming industries and empowering developers to create groundbreaking applications. With the data management software market expected to grow from $94 billion in 2023 to approximately $153 billion by 2027, MongoDB is driving innovation as the leading developer data platform and the first database provider to IPO in over 20 years.
            </p>
            <h2 className="text-xl font-bold mt-4">Why MongoDB?</h2>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Innovative Culture:</strong> Collaborate with full-time engineers and contribute to production-level code.</li>
              <li><strong>Real Impact:</strong> Work on meaningful projects that shape our products and impact millions of users.</li>
              <li><strong>Dynamic Learning:</strong> Gain hands-on experience and learn standard development methodologies.</li>
            </ul>
            <h2 className="text-xl font-bold mt-4">What We’re Looking For:</h2>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Educational Background:</strong> Pursuing a Bachelor’s or Master’s degree in Computer Science, Computer Engineering, or a related field.</li>
              <li><strong>Technical Skills:</strong> Proficiency in data structures, algorithms, and software design. Fluent in one of the following programming languages: Java, Python, Go, C++, JavaScript, Node.js, or a comparable object-oriented language.</li>
              <li><strong>Availability:</strong> Minimum of one semester remaining after the internship (Graduation between Winter 2025 and Spring 2026).</li>
              <li><strong>Work Authorization:</strong> Must have full Canadian working rights.</li>
            </ul>
            <h2 className="text-xl font-bold mt-4">Our Teams and Opportunities:</h2>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Developer Productivity:</strong> Work on enhancing our performance benchmarking system and collaborate with engineers globally to improve our products' performance.</li>
              <li><strong>Replicated Storage Services:</strong> Contribute to developing algorithms for data storage, managing transactional access, and working on server components and replication systems.</li>
              <li><strong>Storage Engines:</strong> Join the team working on WiredTiger, our open-source storage engine, to develop production-level code and collaborate with a diverse, globally distributed team.</li>
              <li><strong>App Modernisation & Integration:</strong> Engage in full-stack projects focusing on data migration, code modernization, and AI-driven insights with technologies like Typescript, Java, Go, and NodeJS.</li>
            </ul>
            <h2 className="text-xl font-bold mt-4">What You’ll Experience at MongoDB:</h2>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Supportive Environment:</strong> Personalized mentorship, career coaching, and a focus on work-life harmony.</li>
              <li><strong>Vibrant Community:</strong> Connect with a community of interns, participate in social events, and enjoy local activities.</li>
              <li><strong>Career Growth:</strong> Potential to receive a full-time offer at the end of your internship.</li>
            </ul>
            <p className="mt-4">
              Our internships are full-time (40 hours/week) for 10 consecutive weeks, running from December to February. MongoDB is committed to providing accommodations for individuals with disabilities during the application and interview process. If you need assistance, please inform your Early Talent Recruiter.
            </p>
          </div>
        )}

        {selectedTab === 'applicants' && (
          <div className="mt-4">
            {selectedApplicant ? (
              <div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="mb-4 p-2 bg-red-500 text-white rounded"
                >
                  X
                </button>
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
                          <h3 className="text-xl font-bold">
                            {atsScore !== null ? `${atsScore}% ATS Match` : 'Calculating ATS Match...'}
                          </h3>
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
                          <Radar name="Skills" dataKey="level" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Tooltip />
                        </RadarChart>
                      </div>
                    </div>

                    <div>
                     <h3 className="font-semibold">{jobCompatibility.explanation !== null ? `${jobCompatibility.explanation}` : 'Skill Compatibility...'}</h3>
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
                      <tr
                        key={index}
                        className="cursor-pointer"
                        onClick={() => setSelectedApplicant(applicant)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {applicant.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applicant.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applicant.github ? (
                            <a href={applicant.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              Github
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applicant.devpost ? (
                            <a href={applicant.devpost} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              Devpost
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applicant.linkedin ? (
                            <a href={applicant.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              Linkdin
                            </a>
                          ) : 'N/A'}
                        </td>
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
    </div>
  );
}
