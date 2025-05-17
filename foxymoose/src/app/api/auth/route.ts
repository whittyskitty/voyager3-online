import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const response = await fetch(
      `https://voyagerwebapi.anchordistributors.com/api/RegistryAPI/ExecuteSyncUsernameAccess?pUsername=${encodeURIComponent(email)}&pExpireInDays=365`,
      {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 