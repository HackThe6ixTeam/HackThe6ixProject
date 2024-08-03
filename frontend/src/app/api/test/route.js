import { NextResponse } from 'next/server';
import User from '@/lib/models/User';  // Adjust this import based on your project structure
import axios from 'axios';

export async function GET(req) {
    try {
        // Fetch the user from the database
        const user = await User.findById("66ae17c02914d745e23ec187");

        if (!user || !user.github_token) {
            return NextResponse.json({ error: 'User not found or GitHub token missing' }, { status: 404 });
        }

        // Make a request to the GitHub API
        const githubResponse = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `Bearer ${user.github_token}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            params: {
                type: 'all',  // This fetches all repos: public, private, and member
                sort: 'full_name',
                per_page: 100  // Adjust this number based on how many repos you want to fetch at once
            }
        });

        // Extract repository information from the GitHub API response
        const repos = githubResponse.data.map(repo => ({
            name: repo.name,
            private: repo.private,
            description: repo.description,
            url: repo.html_url
        }));

        // Extract repository names from the GitHub API response
        const repoNames = githubResponse.data.map(repo => repo.name);

        return NextResponse.json({ repositories: repoNames }, { status: 200 });
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        
        if (error.response && error.response.status === 401) {
            return NextResponse.json({ error: 'GitHub authentication failed. Token may be invalid.' }, { status: 401 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}