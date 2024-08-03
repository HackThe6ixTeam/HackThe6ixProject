'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const Page = () => {
    const [message, setMessage] = useState('Processing your Github authorization...');
    const searchParams = useSearchParams();

    useEffect(() => {
        const updateGithubToken = async () => {
            const access_token = searchParams.get('access_token');
            const userId = localStorage.getItem('userId');

            if (!access_token || !userId) {
                setMessage('Error: Missing required information');
                return;
            }

            try {
                const response = await fetch('/api/update-github-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, access_token }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update Github token');
                }

                const data = await response.json();
                const jobId = data.jobId;

                console.log('userId', userId);
                console.log('jobId', jobId);

                // Trigger the begin-processing endpoint
                const processingResponse = await fetch('https://hackthe6ixproject-djaqetkl4a-uc.a.run.app/begin-processing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, jobId }),
                });

                if (!processingResponse.ok) {
                    throw new Error('Failed to begin processing');
                }

                const processingData = await processingResponse.json();
                setMessage('Thank you for authorizing Github! Your information has been updated.');
                console.log('Processing data:', processingData);

            } catch (error) {
                console.error('Error:', error);
                setMessage('An error occurred while processing your Github authorization.');
            }
        };

        updateGithubToken();
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-6">{message}</h1>
            </div>
        </div>
    );
};

export default Page;
