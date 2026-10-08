import { NextResponse } from 'next/server';
import { config } from '../../../lib/config';

export async function GET() {
  const baseUrl = config.PUBLIC_BASE_URL;
  return NextResponse.json({
    resource: baseUrl,
    authorization_servers: [baseUrl]
  });
}
