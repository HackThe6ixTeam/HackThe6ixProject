// src/app/api/jobs/[id]/route.js

export async function GET(req, { params }) {
    const { id } = params;
  
    try {
      const job = await fetchJobById(id); // Fetch job data
      if (job) {
        return new Response(JSON.stringify(job), { status: 200 });
      } else {
        return new Response(JSON.stringify({ message: 'Job not found' }), { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
  }
  
  async function fetchJobById(id) {
    // Mock job data with applicants and resumes
    const jobs = [
      {
        job: 'Software Engineer',
        type: 'FULL_TIME',
        created: '2024-01-15',
        location: 'Toronto',
        description: 'Develop and maintain software applications.',
        keywords: ['Python', 'JavaScript', 'React', 'Node.js', 'CSS', 'HTML', 'Java', 'SQL', 'TypeScript', 'C++'],
        applicants: [
          {
            name: 'Alice Johnson',
            submitted: '2024-07-15',
            status: 'Interviewed',
            resume: `
              Alice Johnson
              555-123-4567 | alice.johnson@example.com | linkedin.com/in/alicejohnson | github.com/alicejohnson
              Education
              University of Toronto Toronto, Ontario
              Bachelor of Science in Computer Science Sep. 2018 – June 2022
              Experience
              Software Developer Intern May 2021 – Aug. 2021
              TechCorp Toronto, Ontario
              • Developed new features for the company's web applications.
              • Collaborated with the team to troubleshoot and resolve bugs.
              • Utilized JavaScript, React, and Node.js for development.
              Projects
              WebApp | React, Node.js, MongoDB
              • Developed a web application with real-time chat features.
              • Implemented authentication and authorization using JWT.
              Technical Skills
              Languages: JavaScript, Python, HTML/CSS
              Frameworks: React, Node.js
              Developer Tools: Git, VS Code
              `
          },
          // other applicants...
        ],
        status: 'open',
      },
      {
        job: 'Data Scientist',
        type: 'FULL_TIME',
        created: '2024-02-20',
        location: 'Vancouver',
        description: 'Analyze and interpret complex data to help companies make decisions.',
        keywords: ['Python', 'SQL', 'Java', 'JavaScript', 'R', 'HTML', 'CSS', 'Node.js', 'Tableau', 'Scikit-Learn'],
        applicants: [
          {
            name: 'Emma Wilson',
            submitted: '2024-07-18',
            status: 'Interviewed',
            resume: `
              Emma Wilson
              555-222-3333 | emma.wilson@example.com | linkedin.com/in/emmawilson | github.com/emmawilson
              Education
              University of British Columbia Vancouver, BC
              Master of Data Science Sep. 2019 – June 2021
              Experience
              Data Analyst Intern Jun. 2020 – Aug. 2020
              Data Solutions Vancouver, BC
              • Analyzed data sets to uncover insights and trends.
              • Created visualizations and reports for stakeholder presentations.
              Projects
              DataViz | Python, Tableau
              • Developed interactive dashboards for data visualization.
              Technical Skills
              Languages: Python, SQL
              Tools: Tableau, Pandas
              `
          },
          // other applicants...
        ],
        status: 'in_review',
      },
      {
        job: 'Product Manager',
        type: 'PART_TIME',
        created: '2024-03-05',
        location: 'Montreal',
        description: 'Oversee the development and marketing of products.',
        keywords: ['Market Research', 'Product Roadmap', 'Agile', 'Scrum', 'Customer Feedback', 'Competitive Analysis', 'Stakeholder Management', 'Project Management', 'User Stories', 'KPIs'],
        applicants: [
          {
            name: 'Olivia Brown',
            submitted: '2024-07-25',
            status: 'Under Review',
            resume: `
              Olivia Brown
              555-444-5555 | olivia.brown@example.com | linkedin.com/in/oliviabrown | github.com/oliviabrown
              Education
              McGill University Montreal, QC
              Master of Business Administration Sep. 2018 – June 2020
              Experience
              Product Manager Intern May 2019 – Aug. 2019
              Product Innovations Montreal, QC
              • Assisted in managing product lifecycle and roadmap.
              • Conducted market research and competitive analysis.
              Projects
              ProductLaunch | Product Management Tools
              • Coordinated a product launch and marketing campaign.
              Technical Skills
              Skills: Market Research, Product Roadmap
              `
          }
        ],
        status: 'closed',
      },
      {
        job: 'UX Designer',
        type: 'FULL_TIME',
        created: '2024-04-12',
        location: 'Calgary',
        description: 'Design user interfaces and experiences for products.',
        keywords: ['UX Design', 'Wireframes', 'Prototypes', 'User Research', 'Usability Testing', 'Sketch', 'Figma', 'Adobe XD', 'Responsive Design', 'Interaction Design'],
        applicants: [
          {
            name: 'Sophia Martinez',
            submitted: '2024-07-30',
            status: 'Interviewed',
            resume: `
              Sophia Martinez
              555-555-6666 | sophia.martinez@example.com | linkedin.com/in/sophiamartinez | github.com/sophiamartinez
              Education
              University of Alberta Edmonton, AB
              Bachelor of Design Sep. 2016 – June 2020
              Experience
              UX Designer Intern May 2019 – Aug. 2019
              Design Studio Calgary, AB
              • Designed and prototyped user interfaces for various applications.
              • Conducted user research and usability testing.
              Projects
              UserApp | Sketch, Figma
              • Designed a user-friendly mobile application.
              Technical Skills
              Tools: Sketch, Figma, Adobe XD
              `
          }
        ],
        status: 'open',
      },
      {
        job: 'Marketing Specialist',
        type: 'INTERNSHIP',
        created: '2024-05-18',
        location: 'Ottawa',
        description: 'Create and execute marketing strategies to promote products.',
        keywords: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'PPC', 'Email Marketing', 'Market Research', 'Campaign Management', 'Brand Strategy', 'Data Analysis'],
        applicants: [
          {
            name: 'Ava Davis',
            submitted: '2024-08-01',
            status: 'Under Review',
            resume: `
              Ava Davis
              555-999-0000 | ava.davis@example.com | linkedin.com/in/avadavis | github.com/avadavis
              Education
              Carleton University Ottawa, ON
              Bachelor of Marketing Sep. 2017 – June 2021
              Experience
              Marketing Intern May 2020 – Aug. 2020
              Market Solutions Ottawa, ON
              • Assisted in developing marketing campaigns and content creation.
              • Analyzed campaign performance and provided recommendations.
              Projects
              CampaignX | Marketing Analytics
              • Assisted in the creation and execution of a marketing campaign.
              Technical Skills
              Skills: Market Research, Content Creation
              `
          }
        ],
        status: 'in_review',
      },
      {
        job: 'DevOps Engineer',
        type: 'FULL_TIME',
        created: '2024-06-22',
        location: 'Toronto',
        description: 'Automate and streamline IT operations and software development.',
        keywords: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Azure', 'Terraform', 'Linux', 'Python', 'JavaScript', 'Jenkins'],
        applicants: [
          {
            name: 'Noah Wilson',
            submitted: '2024-08-03',
            status: 'Interviewed',
            resume: `
              Noah Wilson
              555-666-7777 | noah.wilson@example.com | linkedin.com/in/noahwilson | github.com/noahwilson
              Education
              University of Waterloo Waterloo, ON
              Bachelor of Computer Engineering Sep. 2016 – June 2020
              Experience
              DevOps Intern May 2019 – Aug. 2019
              Tech Innovations Toronto, ON
              • Assisted in automating deployment processes and managing cloud infrastructure.
              • Worked on improving CI/CD pipelines and system monitoring.
              Projects
              AutomationTool | Docker, Jenkins
              • Developed tools for automating deployment and testing processes.
              Technical Skills
              Tools: Docker, Jenkins, Kubernetes
              `
          }
        ],
        status: 'open',
      },
      {
        job: 'Cybersecurity Analyst',
        type: 'PART_TIME',
        created: '2024-07-30',
        location: 'Vancouver',
        description: 'Protect and secure the company’s IT systems and networks.',
        keywords: ['Security', 'Penetration Testing', 'Firewalls', 'Incident Response', 'Network Security', 'Vulnerability Assessment', 'SIEM', 'Threat Analysis', 'Cryptography', 'Malware Analysis'],
        applicants: [
          {
            name: 'Ethan Clark',
            submitted: '2024-08-05',
            status: 'Shortlisted',
            resume: `
              Ethan Clark
              555-333-4444 | ethan.clark@example.com | linkedin.com/in/ethanclark | github.com/ethanclark
              Education
              University of Victoria Victoria, BC
              Bachelor of Science in Cybersecurity Sep. 2018 – June 2022
              Experience
              Cybersecurity Intern May 2021 – Aug. 2021
              SecureNet Vancouver, BC
              • Assisted in monitoring and analyzing security threats.
              • Implemented security measures and performed vulnerability assessments.
              Projects
              SecuritySystem | Security Tools
              • Developed a system for detecting and mitigating security threats.
              Technical Skills
              Tools: Security Tools, Penetration Testing
              `
          }
        ],
        status: 'closed',
      }
    ];
  
    const job = jobs.find((job) => job.id === id);
  
    if (job) {
      // Extract keywords from the job
      const keywords = job.keywords;
  
      // Function to calculate compatibility based on resume
      const calculateCompatibility = (resume) => {
        let matchCount = 0;
        const resumeText = resume.toLowerCase();
  
        keywords.forEach((keyword) => {
          if (resumeText.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        });
  
        // Calculate compatibility as a percentage of matched keywords
        return (matchCount / keywords.length) * 100;
      };
  
      // Update applicant compatibility scores
      job.applicants.forEach((applicant) => {
        applicant.compatibility = calculateCompatibility(applicant.resume);
      });
    }
  
    return job;
  }
  