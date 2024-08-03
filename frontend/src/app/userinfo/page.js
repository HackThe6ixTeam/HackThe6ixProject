'use client'; // Mark this component as a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pdfToText from 'react-pdftotext';
import { useUser } from '@auth0/nextjs-auth0/client'; // Ensure correct import for client

const UserInfo = () => {
  const { user, error, isLoading } = useUser();

  const [devpost, setDevpost] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    let text;

    if (resume) {
      try {
        text = await pdfToText(resume);
        
        // Convert text to a file and trigger download
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        URL.revokeObjectURL(url);

        // Save text to state or handle as needed
        setResumeText(text);
        console.log('Resume Text:', text);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
      }
    }

    // Log user info
    const userInfo = { 
      devpost, 
      github, 
      github_token: '',
      linkedin, 
      user: user ? { name: user.name, email: user.email } : 'No user info available',
      resumeText: text
    }

    console.log(userInfo);

    const res = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ userInfo }),
      //@ts-ignore
      "Content-Type": "application/json",
    });
    if (!res.ok) {
      throw new Error("Failed to create ticket");
    }

    // Redirect to /github auth page
    router.push('/github-auth');
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
