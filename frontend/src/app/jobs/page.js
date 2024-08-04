"use client";
import { useState, useEffect } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const fetchJobs = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/job", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch jobs");
    }

    return res.json();
  } catch (error) {
    console.log("Error loading jobs: ", error);
    return { jobs: [] }; // Return an empty array if there's an error
  }
};

export default function DemoPage() {
  const [data, setData] = useState({ jobs: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      const result = await fetchJobs();
      setData(result);
      setIsLoading(false);
    };

    loadJobs();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!data.jobs.length) {
    return <p>No jobs.</p>;
  }

  const jobs = data.jobs;

  console.log('jobs', jobs);

  return (
    <div className="container mx-auto py-10">
      {/* Header Container */}
        <div className="mx-auto grid w-full max-w-4xl">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Jobs</h1>
          <p className="mt-6 text-xl leading-8 text-gray-700">Job&apos;s you&apos;ve posted will show up here.</p>
        </div>

        <Separator className='my-8'/>

      {/* Data Table */}
      <DataTable columns={columns} data={jobs} />
    </div>
  );
}
