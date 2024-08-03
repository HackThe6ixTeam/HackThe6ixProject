import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
    }

    // If we have both parameters, redirect to /github-auth/confirm
    const redirectUrl = `/github-auth/confirm?code=${code}&state=${state}`;
    return NextResponse.redirect(new URL(redirectUrl, req.url));
}