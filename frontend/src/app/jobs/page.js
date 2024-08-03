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
    return [
      {
        id: 'b1e8f4e0-0b2c-4f2d-a0d4-9d4d9d62dfbb',
        job: 'Software Engineer',
        type: 'FULL_TIME',
        created: '2024-01-15',
        location: 'Toronto',
        applicants: 123,
        status: 'open',
        keywords: ['Python', 'JavaScript', 'React', 'Node.js', 'CSS', 'HTML', 'Java', 'SQL', 'TypeScript', 'C++']
      },
      {
        id: 'f9aebd89-dae4-4c3e-9e5b-4e10a71a2487',
        job: 'Data Scientist',
        type: 'FULL_TIME',
        created: '2024-02-20',
        location: 'Vancouver',
        applicants: 87,
        status: 'in_review',
        keywords: ['Python', 'SQL', 'Java', 'JavaScript', 'R', 'HTML', 'CSS', 'Node.js', 'MATLAB', 'Scala']
      },
      {
        id: 'c6d7485e-9c3d-4c0a-a27f-15b8c8b134ed',
        job: 'Product Manager',
        type: 'PART_TIME',
        created: '2024-03-05',
        location: 'Montreal',
        applicants: 56,
        status: 'closed',
        keywords: ['Java', 'Python', 'React', 'HTML', 'CSS', 'JavaScript', 'Node.js', 'SQL', 'Ruby', 'PHP']
      },
      {
        id: '8f6a7f8d-d5e9-4a95-9d58-2bfb2f7d23ed',
        job: 'UX Designer',
        type: 'FULL_TIME',
        created: '2024-04-12',
        location: 'Calgary',
        applicants: 174,
        status: 'open',
        keywords: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Figma', 'Sketch', 'Photoshop', 'InVision', 'Axure']
      },
      {
        id: 'af5c9824-4f6c-4b6b-9100-36d6d8c8b89e',
        job: 'Marketing Specialist',
        type: 'INTERNSHIP',
        created: '2024-05-18',
        location: 'Ottawa',
        applicants: 92,
        status: 'in_review',
        keywords: ['SEO', 'Google Analytics', 'HTML', 'CSS', 'JavaScript', 'Social Media', 'Content Marketing', 'Email Marketing', 'PPC', 'CRM']
      },
      {
        id: '2b00a4d5-85d7-4d8f-9a87-3eacbc60d441',
        job: 'DevOps Engineer',
        type: 'FULL_TIME',
        created: '2024-06-22',
        location: 'Toronto',
        applicants: 139,
        status: 'open',
        keywords: ['Docker', 'Kubernetes', 'Python', 'Java', 'JavaScript', 'CI/CD', 'AWS', 'Azure', 'Terraform', 'Linux']
      },
      {
        id: '5a1e6f2b-8293-4f57-a9c0-22e3e0b6c8a1',
        job: 'Cybersecurity Analyst',
        type: 'PART_TIME',
        created: '2024-07-30',
        location: 'Vancouver',
        applicants: 65,
        status: 'closed',
        keywords: ['Python', 'JavaScript', 'C++', 'SQL', 'Network Security', 'Ethical Hacking', 'Firewalls', 'Intrusion Detection', 'Malware Analysis', 'Cryptography']
      }
    ];
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
