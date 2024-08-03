"use client";
import { useState, useEffect } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';

async function fetchJobs() {
    const res = await fetch('/api/job', {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return res.json();
  }
  
  async function postJob(newJob) {
    const res = await fetch('/api/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newJob),
    });
  
    if (!res.ok) {
      throw new Error('Failed to post job');
    }
    return res.json();
  }
  

export default function DemoPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const jobs = await fetchJobs();
        setData(jobs);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, []);

  return (
    <div className="container mx-auto py-10">
      {/* Header Container */}
      <div className="flex items-center justify-between mb-4">
        {/* Tile/Header */}
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
