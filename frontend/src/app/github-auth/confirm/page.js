'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const Page = () => {
    const [message, setMessage] = useState('Processing your Github authorization...');
    const searchParams = useSearchParams();

    useEffect(() => {
        const updateGithubToken = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const userId = localStorage.getItem('userId');

            if (!code || !state || !userId) {
                setMessage('Error: Missing required information');
                return;
            }

            try {
                const response = await fetch('/api/update-github-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, code }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update Github token');
                }

                const data = await response.json();
                setMessage('Thank you for authorizing Github! Your information has been updated.');
            } catch (error) {
                console.error('Error updating Github token:', error);
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