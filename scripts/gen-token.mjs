import { SignJWT } from 'jose';

const secret = process.env.OAUTH_BRIDGE_SECRET || 'dev-bridge-secret-for-local-testing-only-1234567890';
const encoder = new TextEncoder();

async function main() {
  const token = await new SignJWT({ sub: 'dev_grant', name: 'MCP Inspector Test Client' })
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('mcp_server')
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encoder.encode(secret));

  console.log('--- テスト用 Bearer トークン (24時間有効) ---');
  console.log(token);
  console.log('\nMCP Inspector の Custom Headers に設定する場合:');
  console.log(`Authorization: Bearer ${token}`);
}

main().catch(console.error);
