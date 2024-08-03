import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
    }

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: 'http://127.0.0.1:3000/api/github',
        }, {
            headers: {
                Accept: 'application/json'
            }
        });

        const { access_token, scope, token_type } = tokenResponse.data;

        if (!access_token) {
            throw new Error('Failed to obtain access token');
        }

        // If we have both parameters and successfully obtained the access token, 
        // redirect to /github-auth/confirm with all necessary information
        const redirectUrl = `/github-auth/confirm?code=${code}&state=${state}&access_token=${access_token}&scope=${scope}&token_type=${token_type}`;
        return NextResponse.redirect(new URL(redirectUrl, req.url));

    } catch (error) {
        console.error('Error exchanging code for access token:', error);
        return NextResponse.json({ error: 'Failed to exchange code for access token' }, { status: 500 });
    }
}