// middleware.ts
import type { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest, response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
}