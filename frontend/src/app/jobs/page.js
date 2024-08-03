import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  function generateRandomJob() {
    const jobTitles = [
      "Software Engineering Intern (8 Month)",
      "Data Science Intern (6 Month)",
      "Product Management Intern (4 Month)",
      "UX Design Intern (3 Month)",
      "Marketing Intern (6 Month)",
      "DevOps Intern (12 Month)"
    ];
    
    const jobTypes = ["INTERNSHIP", "FULL_TIME", "PART_TIME"];
    const locations = ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"];
    const statuses = ["open", "closed", "in_review"];
    
    return {
      id: crypto.randomUUID(), // Generate a unique ID
      job: `2024 ${getRandomElement(jobTitles)}`,
      type: getRandomElement(jobTypes),
      created: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      location: getRandomElement(locations),
      applicants: Math.floor(Math.random() * 500) + 50, // Random number between 50 and 550
      status: getRandomElement(statuses),
    };
  }
  
  async function getData() {
    // Generate 6 random jobs
    const jobs = Array.from({ length: 6 }, generateRandomJob);

  
    return jobs;
  }
  

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      {/* Header Container */}
      <div className="flex items-center justify-between mb-4">
        {/* Tile/Header */}
        <h1 className="text-2xl font-bold">Jobs</h1>
        
        {/* Button */}
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          ADD
        </Button>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={data} />
    </div>
  );
}
