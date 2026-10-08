import { NextRequest, NextResponse } from 'next/server';
import { signJWT } from '../../lib/tokens';
import { config } from '../../lib/config';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // We are a stateless server, so we issue a JWT as the client_id containing their redirect_uris.
  // This avoids needing a database to store dynamic client registrations.
  const payload = {
    redirect_uris: body.redirect_uris || [],
    client_name: body.client_name || 'Gemini Spark (Dynamic Client)',
    // We could store other metadata if needed
  };

  const clientId = await signJWT(payload, config.OAUTH_SIGNING_KEY, '10y', 'client_id'); // long lived client_id

  return NextResponse.json({
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: body.redirect_uris || [],
    token_endpoint_auth_method: 'none', // Public client (PKCE)
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
  }, { status: 201 });
}
