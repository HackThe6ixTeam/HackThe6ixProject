'use client'; // Mark this component as a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pdfToText from 'react-pdftotext';
import { useUser } from '@auth0/nextjs-auth0/client'; // Ensure correct import for client

const UserInfo = ({ user }) => {
  const [devpost, setDevpost] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (resume) {
      try {
        const text = await pdfToText(resume);
        
        // Convert text to a file and trigger download
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);

        // Save text to state or handle as needed
        setResumeText(text);
        console.log('Resume Text:', text);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
      }
    }

    // Log user info
    console.log({ 
      devpost, 
      github, 
      linkedin, 
      user: user ? { name: user.name, email: user.email } : 'No user info available'
    });

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
