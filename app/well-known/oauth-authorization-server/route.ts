import { NextResponse } from 'next/server';
import { config } from '../../../lib/config';

export async function GET() {
  const baseUrl = config.PUBLIC_BASE_URL;
  return NextResponse.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    registration_endpoint: `${baseUrl}/register`,
    jwks_uri: `${baseUrl}/jwks.json`,
    scopes_supported: ["mcp"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"]
  });
}
