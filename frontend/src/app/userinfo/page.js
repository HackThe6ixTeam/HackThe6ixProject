'use client'; // Mark this component as a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import pdfToText from 'react-pdftotext';
import { useUser } from '@auth0/nextjs-auth0/client'; // Ensure correct import for client
import { Separator } from '@/components/ui/separator';
import { FileText, X } from 'lucide-react'; // Assuming you have these icons
import { Button } from '@/components/ui/button'; // Ensure correct import for Button
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUserType } from '@/context/UserTypeContext';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Adjust path if necessary

function bytesToMB(bytes) {
  let megabytes = bytes / 1024 / 1024;
  return megabytes.toFixed(2);
}

const UserInfo = () => {
  const { user, error, isLoading } = useUser();
  const { userType, devpost, github, linkedin } = useUserType();
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [fileMetaData, setFileMetaData] = useState(null);
  const [userId, setUserId] = useState(null); // State for storing userId
  const router = useRouter();

  useEffect(() => {
    console.log(userType)
    if (userType && userType === 'hiringManager') {
      router.push('/jobs');
    }
  }, [userType, router]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setResume(file);
      setFileMetaData({
        name: file.name,
        size: file.size,
      });

      try {
        const text = await pdfToText(file);
        setResumeText(text);
        console.log('Resume Text:', text);
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      console.error('No user logged in');
      return;
    }

    const authUserId = user.sub; // Use Auth0 user ID or another unique user identifier

    const userInfo = { 
      devpost, 
      github, 
      github_token: 'temp',
      linkedin, 
      user: user ? { name: user.name, email: user.email } : 'No user info available',
      resumeText,
      jobs: [
        "66af31b72add7458f9217c0c"
      ]
    };

    console.log(userInfo);

    try {
      // Submit user info to your API and get the userId
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInfo }),
      });

      if (!res.ok) {
        throw new Error("Failed to create user");
      }

      const data = await res.json();
      console.log("API Response:", data);

      if (data.userId) { // Use userId from the API response
        setUserId(data.userId); // Store userId in state
        console.log("User ID:", data.userId);

        // Upload resume to Firebase Storage with userId as filename
        if (resume) {
          const resumeRef = ref(storage, `${data.userId}.pdf`);
          await uploadBytes(resumeRef, resume);
          const downloadURL = await getDownloadURL(resumeRef);
          console.log('Resume URL:', downloadURL);
          
          // You can store the downloadURL with the user's info if needed
        }

        // Store the userId in localStorage or in your app's state management system if needed
        localStorage.setItem('userId', data.userId);

        // Redirect to /github auth page
        router.push('/github-auth');
      } else {
        console.error("No userId returned from API");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10 text-left">
        <div className="mx-auto grid w-full max-w-3xl">
          <p className="text-base font-semibold leading-7 text-primary"></p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Upload your resume</h1>
          <p className="mt-6 text-xl leading-8 text-gray-700">
            We&apos;ll extract skills from your resume to match you with suitable employers.
          </p>
        </div>

        <Separator />

        <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-3xl items-start">
          { !resume ? (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 5MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <FileText />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {fileMetaData.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {`${bytesToMB(fileMetaData.size)} MB`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setResume(null);
                setFileMetaData(null);
              }}>
                <X />
              </Button>
            </div>
          )}

          <div className='my-8'>
            <Button type="submit" className='w-20'>
              Submit
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UserInfo;