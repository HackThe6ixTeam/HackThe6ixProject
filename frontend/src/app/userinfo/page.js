'use client'; // Mark this component as a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UserInfo = () => {
  const [devpost, setDevpost] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resume, setResume] = useState(null);

  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Handle form submission (e.g., send data to an API or server)
    console.log({ devpost, github, linkedin, resume });

    // Redirect to /finished page
    router.push('/finished');
  };

  return (
    <div>
      <h1>User Information</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="devpost">Devpost:</label>
          <input
            type="url"
            id="devpost"
            value={devpost}
            onChange={(e) => setDevpost(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="github">GitHub:</label>
          <input
            type="url"
            id="github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="linkedin">LinkedIn:</label>
          <input
            type="url"
            id="linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="resume">Resume (PDF):</label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default UserInfo;
