import { NextRequest, NextResponse } from 'next/server';
import { createAuthorizationCode } from '../../lib/tokens';
import { config } from '../../lib/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const client_id = searchParams.get('client_id');
  const redirect_uri = searchParams.get('redirect_uri');
  const code_challenge = searchParams.get('code_challenge');
  const code_challenge_method = searchParams.get('code_challenge_method');
  const state = searchParams.get('state');
  
  if (!client_id || !redirect_uri || !code_challenge || code_challenge_method !== 'S256') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // We redirect the user to the Rental Server's consent screen.
  // The rental server will verify the user via passkey and ask for consent.
  // When approved, it will redirect back to our /oauth/callback
  
  // We need to pass our state to the rental server so we can track the flow.
  // The rental server will return this state along with the grant_id.
  
  const callbackUrl = new URL('/oauth/callback', config.PUBLIC_BASE_URL).toString();
  
  // Actually, we pass our state and the original client request state to the rental server.
  // It's simpler to just pack them in state.
  const packedState = Buffer.from(JSON.stringify({
    client_id,
    redirect_uri,
    code_challenge,
    code_challenge_method,
    state
  })).toString('base64url');

  const consentUrl = new URL(config.RENTAL_CONSENT_URL);
  consentUrl.searchParams.set('state', packedState);
  consentUrl.searchParams.set('client_name', 'Gemini Spark'); // Can be dynamic if we check DB
  consentUrl.searchParams.set('callback', callbackUrl);

  return NextResponse.redirect(consentUrl);
}
