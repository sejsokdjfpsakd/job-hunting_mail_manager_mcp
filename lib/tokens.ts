import { SignJWT, jwtVerify } from 'jose';
import { config } from './config';

export async function signJWT(payload: any, secret: string, expiresIn: string | number, aud: string) {
  const encodedSecret = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience(aud)
    .setExpirationTime(expiresIn)
    .sign(encodedSecret);
}

export async function verifyJWT(token: string, secret: string, aud: string) {
  const encodedSecret = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, encodedSecret, {
    audience: aud,
  });
  return payload;
}

// Token specific helpers
export async function createAuthorizationCode(clientId: string, redirectUri: string, codeChallenge: string, codeChallengeMethod: string) {
  const payload = {
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod
  };
  return signJWT(payload, config.OAUTH_SIGNING_KEY, '5m', 'oauth_code');
}

export async function verifyAuthorizationCode(code: string) {
  return verifyJWT(code, config.OAUTH_SIGNING_KEY, 'oauth_code');
}

export async function createAccessToken(grantId: string) {
  return signJWT({ sub: grantId }, config.OAUTH_BRIDGE_SECRET, '1h', 'mcp_server');
}

export async function createRefreshToken(grantId: string) {
  // Refresh token only needs to be verified by this vercel app
  return signJWT({ sub: grantId }, config.OAUTH_SIGNING_KEY, '30d', 'oauth_refresh');
}

export async function verifyRefreshToken(token: string) {
  return verifyJWT(token, config.OAUTH_SIGNING_KEY, 'oauth_refresh');
}
