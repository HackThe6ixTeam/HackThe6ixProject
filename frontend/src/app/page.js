"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /api/auth/signup when component mounts
    router.push('/api/auth/signup');
  }, [router]);

  return null; // This component does not render anything
};

export default Home;
