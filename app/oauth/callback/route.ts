import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, createAuthorizationCode, signJWT } from '../../../lib/tokens';
import { config } from '../../../lib/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token'); // Signed by Rental Server
  const state = searchParams.get('state'); // In case of errors
  
  if (!token) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  try {
    const payload = await verifyJWT(token, config.OAUTH_BRIDGE_SECRET, 'oauth_callback');
    const packedState = payload.state as string;
    const grantId = payload.grant_id as string;
    
    const parsedState = JSON.parse(Buffer.from(packedState, 'base64url').toString('utf-8'));
    
    // Generate auth code mapping to this grant
    const authCode = await createAuthorizationCode(
      parsedState.client_id, 
      parsedState.redirect_uri, 
      parsedState.code_challenge, 
      parsedState.code_challenge_method
    );
    
    // Auth code needs to contain the grantId as well so token exchange can issue the right tokens
    // We can re-sign it with grantId included
    const finalCodePayload = {
      ...parsedState,
      grant_id: grantId
    };
    const finalCode = await signJWT(finalCodePayload, config.OAUTH_SIGNING_KEY, '5m', 'oauth_code');

    const redirectUrl = new URL(parsedState.redirect_uri);
    redirectUrl.searchParams.set('code', finalCode);
    if (parsedState.state) {
      redirectUrl.searchParams.set('state', parsedState.state);
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Callback error", error);
    return NextResponse.json({ error: 'invalid_request', details: 'Invalid token from rental server' }, { status: 400 });
  }
}
