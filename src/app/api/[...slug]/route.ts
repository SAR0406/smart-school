
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

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from backend' }));
        return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`[API Proxy] Error fetching ${targetUrl}:`, error);
    return NextResponse.json({ error: 'An error occurred while proxying the request.' }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend API URL is not configured' }, { status: 500 });
  }

  const path = params.slug.join('/');
  const targetUrl = `${backendUrl}/${path}`;
  const body = await request.json();

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from backend' }));
        return NextResponse.json(errorData, { status: response.status });
    }

    // Handle streaming responses for chat
    if (body.stream) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`[API Proxy] Error posting to ${targetUrl}:`, error);
    return NextResponse.json({ error: 'An error occurred while proxying the request.' }, { status: 502 });
  }
}
