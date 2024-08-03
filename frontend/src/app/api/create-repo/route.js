import { NextResponse } from 'next/server';
import Repository from '@/lib/models/Repository';

export async function POST(req) {
    try {
        const { user_id, job_id } = await req.json();

        if (!user_id || !job_id) {
            return NextResponse.json({ error: 'Missing user_id or job_id' }, { status: 400 });
        }

        const newRepository = await Repository.create({
            user_id,
            job_id,
            summary: '',  // Initialize with empty string, to be filled later
            ind_file_summaries: [],  // Initialize with empty array, to be filled later
            job_skills: []  // Initialize with empty array, to be filled later
        });

        return NextResponse.json({ 
            message: 'Repository document created successfully',
            repository: newRepository 
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating repository document:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}