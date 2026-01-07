import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error('ADMIN_PASSWORD environment variable is not set!');
            return NextResponse.json({ error: 'Server configuratie fout' }, { status: 500 });
        }

        if (password === adminPassword) {
            const response = NextResponse.json({ success: true });
            response.cookies.set('authenticated', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 dagen
            });
            return response;
        }

        return NextResponse.json({ error: 'Verkeerd wachtwoord' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
    }
}
