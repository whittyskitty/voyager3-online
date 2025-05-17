import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const response = await fetch(
      'https://voyagerwebapi.anchordistributors.com/api/RegistryAPI/GetApiRegistry',
      {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Registry API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registry data' },
      { status: 500 }
    );
  }
} 