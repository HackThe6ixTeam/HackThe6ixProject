// pages/api/update-github-token.js
import { NextResponse } from 'next/server';
import User from '@/lib/models/User';  // Adjust this import based on your project structure

export async function POST(req) {
    try {
        const { userId, access_token } = await req.json();

        if (!userId || !access_token) {
            return NextResponse.json({ error: 'Missing userId or code' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { github_token: access_token },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Github token updated successfully', jobId: updatedUser.jobs[0] }, { status: 200 }); // Assuming user has only one job
    } catch (error) {
        console.error('Error updating Github token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
