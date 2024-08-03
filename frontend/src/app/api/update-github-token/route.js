// pages/api/update-github-token.js
import { NextResponse } from 'next/server';
import User from '@/lib/models/User';  // Adjust this import based on your project structure

export async function POST(req) {
    try {
        const { userId, code } = await req.json();

        if (!userId || !code) {
            return NextResponse.json({ error: 'Missing userId or code' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { github_token: code },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Github token updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating Github token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}