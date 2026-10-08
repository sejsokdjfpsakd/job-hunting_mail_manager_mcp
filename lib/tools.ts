import { z } from 'zod';

const childConditionSchema = z.object({
  type: z.string().optional().describe("Logical operator (AND, OR, NOT)"),
  field: z.string().optional().describe("Field to match (from, to, cc, bcc, subject, body, text, header, date, size, state)"),
  op: z.string().optional().describe("Operator (contains, not_contains, since, before, is, etc.)"),
  operator: z.string().optional(),
  name: z.string().optional().describe("Header name if field is header"),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string())
  ]).optional().describe("Target value")
});

const conditionSchema = z.object({
  type: z.string().optional().describe("Logical operator (e.g. 'AND', 'OR', 'NOT')"),
  field: z.string().optional().describe("Field to match (from, to, cc, bcc, subject, body, text, header, date, size, state)"),
  op: z.string().optional().describe("Operator (contains, not_contains, since, before, is, etc.)"),
  operator: z.string().optional(),
  name: z.string().optional().describe("Header name if field is header"),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string())
  ]).optional().describe("Target value"),
  conditions: z.array(childConditionSchema).optional().describe("Child conditions list"),
  all: z.array(childConditionSchema).optional().describe("All conditions must match (AND)"),
  any: z.array(childConditionSchema).optional().describe("Any condition must match (OR)")
}).describe("Condition tree (e.g., { 'type': 'AND', 'conditions': [...] } or { 'field': 'from', 'op': 'contains', 'value': 'example.com' })");

export const toolSchemas = {
  get_folders: z.object({}),
  create_folder: z.object({
    name: z.string().describe("Name of the new folder (e.g., '就活/A社')")
  }),
  rename_folder: z.object({
    from: z.string().describe("Current folder name"),
    to: z.string().describe("New folder name")
  }),
  delete_folder: z.object({
    name: z.string().describe("Folder to delete (Warning: Will move messages back to INBOX)")
  }),
  get_recent_emails: z.object({
    folder: z.string().default("INBOX"),
    limit: z.number().default(10),
    offset: z.number().default(0),
    unread: z.boolean().optional(),
    subject: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional()
  }),
  search_emails: z.object({
    condition: conditionSchema,
    folder: z.string().default("INBOX"),
    limit: z.number().default(10)
  }),
  get_email: z.object({
    uid: z.string(),
    folder: z.string().default("INBOX"),
    max_chars: z.number().default(20000)
  }),
  move_email: z.object({
    uid: z.string(),
    target_folder: z.string(),
    source_folder: z.string().default("INBOX")
  }),
  list_rules: z.object({}),
  create_rule: z.object({
    name: z.string(),
    target_folder: z.string(),
    condition: conditionSchema,
    is_active: z.boolean().default(true)
  }),
  update_rule: z.object({
    rule_id: z.string(),
    name: z.string().optional(),
    target_folder: z.string().optional(),
    condition: conditionSchema.optional(),
    is_active: z.boolean().optional()
  }),
  delete_rule: z.object({
    rule_id: z.string()
  }),
  preview_rule: z.object({
    condition: conditionSchema
  }),
  run_auto_label: z.object({
    dry_run: z.boolean().default(false),
    rule_id: z.string().optional()
  })
};

