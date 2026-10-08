import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthorizationCode, createAccessToken, createRefreshToken, verifyRefreshToken } from '../../lib/tokens';
import { rentalAPI } from '../../lib/rental-api';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const grant_type = formData.get('grant_type');
  
  if (grant_type === 'authorization_code') {
    const code = formData.get('code') as string;
    const code_verifier = formData.get('code_verifier') as string;
    const client_id = formData.get('client_id') as string;
    const redirect_uri = formData.get('redirect_uri') as string;
    
    if (!code || !code_verifier || !client_id) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    try {
      // 1. Verify JWT
      const payload = await verifyAuthorizationCode(code);
      
      // 2. Validate binding
      if (payload.client_id !== client_id || payload.redirect_uri !== redirect_uri) {
        return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
      }
      
      // 3. PKCE S256 Challenge Verification
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(code_verifier).digest();
      const expectedChallenge = hash.toString('base64url');
      
      if (payload.code_challenge !== expectedChallenge) {
        return NextResponse.json({ error: 'invalid_grant', details: 'PKCE mismatch' }, { status: 400 });
      }
      
      // 4. Mark code as used on Rental Server
      try {
        await rentalAPI.redeemCode(code);
      } catch (e: any) {
         // Already used or expired
         return NextResponse.json({ error: 'invalid_grant', details: 'Code already used' }, { status: 400 });
      }
      
      // 5. Issue tokens
      const grantId = payload.grant_id as string;
      const accessToken = await createAccessToken(grantId);
      const refreshToken = await createRefreshToken(grantId);
      
      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken
      });
      
    } catch (e) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }
  } 
  else if (grant_type === 'refresh_token') {
    const refresh_token = formData.get('refresh_token') as string;
    if (!refresh_token) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }
    
    try {
      const payload = await verifyRefreshToken(refresh_token);
      const grantId = payload.sub as string;
      
      // Check if grant is still active on rental server
      try {
        await rentalAPI.refreshGrant(grantId);
      } catch (e) {
        return NextResponse.json({ error: 'invalid_grant', details: 'Grant revoked or expired' }, { status: 400 });
      }
      
      // Issue new tokens (Refresh Token Rotation)
      const newAccessToken = await createAccessToken(grantId);
      const newRefreshToken = await createRefreshToken(grantId);
      
      return NextResponse.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken
      });
    } catch (e) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }
  }
  
  return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
}
