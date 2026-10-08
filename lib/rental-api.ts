import { config } from './config';

export class RentalAPIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function callRentalAPI(path: string, method: string = 'GET', body?: any, accessToken?: string) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.RENTAL_API_KEY}`
  };
  
  if (accessToken) {
    headers['X-MCP-Access-Token'] = accessToken;
  }
  
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  
  const url = `${config.RENTAL_API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!res.ok) {
    let msg = `Rental API Error: ${res.statusText}`;
    try {
      const errJson = await res.json();
      msg = errJson.error || msg;
    } catch {}
    throw new RentalAPIError(msg, res.status);
  }
  
  return res.json();
}

export const rentalAPI = {
  // OAuth bridge calls
  redeemCode: (codeId: string) => callRentalAPI('/oauth/codes/redeem', 'POST', { code_id: codeId }),
  refreshGrant: (grantId: string) => callRentalAPI(`/oauth/grants/${grantId}/refresh`, 'POST'),
  
  // MCP Tool calls
  getFolders: (token: string) => callRentalAPI('/folders', 'GET', undefined, token),
  createFolder: (token: string, name: string) => callRentalAPI('/folders', 'POST', { name }, token),
  renameFolder: (token: string, from: string, to: string) => callRentalAPI('/folders', 'PATCH', { from, to }, token),
  deleteFolder: (token: string, name: string) => callRentalAPI(`/folders?name=${encodeURIComponent(name)}`, 'DELETE', undefined, token),
  
  getRecentEmails: (token: string, query: Record<string, any>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) {
         if (typeof v === 'object') {
           params.set(k, JSON.stringify(v));
         } else {
           params.set(k, String(v));
         }
      }
    }
    return callRentalAPI(`/emails?${params.toString()}`, 'GET', undefined, token);
  },
  
  getEmail: (token: string, uid: string, folder: string) => 
    callRentalAPI(`/emails/${uid}?folder=${encodeURIComponent(folder)}`, 'GET', undefined, token),
    
  moveEmail: (token: string, uid: string, target_folder: string, source_folder: string) =>
    callRentalAPI('/emails/move', 'POST', { uid, target_folder, source_folder }, token),
    
  listRules: (token: string) => callRentalAPI('/rules', 'GET', undefined, token),
  createRule: (token: string, rule: any) => callRentalAPI('/rules', 'POST', rule, token),
  updateRule: (token: string, id: string, updates: any) => callRentalAPI(`/rules/${id}`, 'PUT', updates, token),
  deleteRule: (token: string, id: string) => callRentalAPI(`/rules/${id}`, 'DELETE', undefined, token),
  previewRule: (token: string, condition: any) => callRentalAPI('/rules/preview', 'POST', { condition }, token),
  runAutoLabel: (token: string, dry_run: boolean, rule_id?: string) => callRentalAPI('/rules/run', 'POST', { dry_run, rule_id }, token)
};

