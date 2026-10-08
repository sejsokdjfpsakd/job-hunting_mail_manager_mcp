import { createMcpHandler } from 'mcp-handler';
import { NextResponse, NextRequest } from 'next/server';
import { toolSchemas } from '../../../lib/tools';
import { rentalAPI } from '../../../lib/rental-api';
import { verifyJWT } from '../../../lib/tokens';
import { config } from '../../../lib/config';

function getToken(ctx: any): string {
  const auth = ctx.http?.request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.substring(7);
  }
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return "dev_token";
  }
  return "";
}

// Create the MCP server handler
const mcpHandler = createMcpHandler((server) => {
  server.registerTool(
    "get_folders",
    {
      title: "Get Folders",
      description: "List all IMAP folders and their status",
      inputSchema: toolSchemas.get_folders
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.getFolders(token);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "create_folder",
    {
      title: "Create Folder",
      description: "Create a new IMAP folder",
      inputSchema: toolSchemas.create_folder
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.createFolder(token, args.name);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "rename_folder",
    {
      title: "Rename Folder",
      description: "Rename an existing IMAP folder",
      inputSchema: toolSchemas.rename_folder
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.renameFolder(token, args.from, args.to);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "delete_folder",
    {
      title: "Delete Folder",
      description: "Delete an IMAP folder",
      inputSchema: toolSchemas.delete_folder
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.deleteFolder(token, args.name);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "get_recent_emails",
    {
      title: "Get Recent Emails",
      description: "Get recent emails with basic filtering",
      inputSchema: toolSchemas.get_recent_emails
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.getRecentEmails(token, args);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "search_emails",
    {
      title: "Search Emails",
      description: "Search emails using a condition tree",
      inputSchema: toolSchemas.search_emails
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.getRecentEmails(token, {
        folder: args.folder,
        limit: args.limit,
        q: args.condition
      });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "get_email",
    {
      title: "Get Email Content",
      description: "Get full details of a specific email by UID",
      inputSchema: toolSchemas.get_email
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.getEmail(token, args.uid, args.folder);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "move_email",
    {
      title: "Move Email",
      description: "Move an email to another folder",
      inputSchema: toolSchemas.move_email
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.moveEmail(token, args.uid, args.target_folder, args.source_folder);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "list_rules",
    {
      title: "List Auto-Label Rules",
      description: "List all auto-label rules",
      inputSchema: toolSchemas.list_rules
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.listRules(token);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "create_rule",
    {
      title: "Create Rule",
      description: "Create a new auto-label rule",
      inputSchema: toolSchemas.create_rule
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.createRule(token, args);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "update_rule",
    {
      title: "Update Rule",
      description: "Update an existing auto-label rule",
      inputSchema: toolSchemas.update_rule
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.updateRule(token, args.rule_id, args);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "delete_rule",
    {
      title: "Delete Rule",
      description: "Delete an auto-label rule",
      inputSchema: toolSchemas.delete_rule
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.deleteRule(token, args.rule_id);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "preview_rule",
    {
      title: "Preview Rule",
      description: "Preview how a rule translates to IMAP SEARCH",
      inputSchema: toolSchemas.preview_rule
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.previewRule(token, args.condition);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );

  server.registerTool(
    "run_auto_label",
    {
      title: "Run Auto-Labeling",
      description: "Execute auto-labeling rules on INBOX",
      inputSchema: toolSchemas.run_auto_label
    },
    async (args, ctx) => {
      const token = getToken(ctx);
      const res = await rentalAPI.runAutoLabel(token, args.dry_run, args.rule_id);
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );
}, {
  capabilities: {
    prompts: {},
    resources: {},
    tools: {}
  }
});

// Middleware to protect the MCP endpoint
async function withAuth(req: NextRequest) {
  // ローカル開発・検証モード: DEV_BYPASS_AUTHがtrueの場合は認証をパス
  if (process.env.DEV_BYPASS_AUTH === "true") {
    return mcpHandler(req);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse(null, {
      status: 401,
      headers: { 'WWW-Authenticate': `Bearer realm="MCP", error="invalid_token"` }
    });
  }

  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token, config.OAUTH_BRIDGE_SECRET, 'mcp_server');
    return mcpHandler(req);
  } catch (e) {
    return new NextResponse(null, {
      status: 401,
      headers: { 'WWW-Authenticate': `Bearer realm="MCP", error="invalid_token"` }
    });
  }
}

export async function GET(req: NextRequest) {
  // Return a 200 OK for GET requests to avoid 405 Method Not Allowed errors
  // from clients like MCP Inspector that might probe the endpoint with GET.
  // This server uses Streamable HTTP which handles operations via POST.
  return new NextResponse("MCP Streamable HTTP Endpoint. Please use POST.", { status: 200 });
}

export const POST = withAuth;

