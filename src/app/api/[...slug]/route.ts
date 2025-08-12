import { NextRequest, NextResponse } from 'next/server';

// This route acts as a proxy to the backend API.
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend API URL is not configured' }, { status: 500 });
  }

  const path = params.slug.join('/');
  const { search } = new URL(request.url);
  const targetUrl = `${backendUrl}/${path}${search}`;
  
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);

  } catch (error) {
    console.error(`[API Proxy] Error fetching ${targetUrl}:`, error);
    return NextResponse.json({ error: 'An error occurred while proxying the request.' }, { status: 502 });
  }
}