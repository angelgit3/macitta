---
description: Rules for Supabase MCP integration and Database Standardization
---

# Supabase & Database Interaction Rules

## 1. MCP Integration Protocol
You have DIRECT access to the project's database via the **Supabase MCP Server**. 
- **NEVER** generate `.sql` files to ask the user to run them manually.
- **ALWAYS** use the available MCP tools (`execute_sql`, `apply_migration`, `list_tables`) to perform database operations directly.
- **ALWAYS** verify the result of your operations (e.g., check if a table exists after creation).

## 2. Standardization of Database Changes
Follow this strict workflow for any database modification:

### A. Planning Phase
1.  **Analyze**: Check the current state using `list_tables` or `execute_sql` to inspect schemas.
2.  **Propose**: Explain the changes to the user (tables, columns, policies) and get approval.

### B. Execution Phase (Direct MCP)
1.  **Migrations First**: For DDL (CREATE/ALTER/DROP), use `apply_migration` if available, or `execute_sql` as a fallback.
    *   *Naming Convention*: Use snake_case for tables (`user_cards`, `study_logs`).
    *   *IDs*: Always use `uuid` as primary key with `default gen_random_uuid()`.
    *   *Timestamps*: Always include `created_at` with `default timezone('utc'::text, now())`.
2.  **RLS Policies**: EVERY new table must have Row Level Security enabled immediately.
    *   `alter table public.table_name enable row level security;`
    *   Create specific policies for SELECT, INSERT, UPDATE, DELETE.
    *   Avoid broad "public" access unless strictly necessary (like for read-only static dictionaries).

### C. Verification Phase
1.  **Verify**: Run a query to confirm the changes (e.g., insert a dummy row and read it back, or query `information_schema`).

## 3. Data Integrity & Types
- **Foreign Keys**: Always define foreign keys with `on delete cascade` to maintain referential integrity (unless soft-delete is required).
- **Enums**: Use Postgres ENUM types or check constraints for state fields (e.g., validation status, difficulty levels).
- **JSONB**: Use `jsonb` for flexible data, but prefer structured columns for queryable fields.

## 4. Error Handling
- If a query fails, analyze the error message.
- If it's a permissions error, inform the user and suggest checking their Supabase dashboard RLS or rights.
- **Rollback**: If a multi-step operation fails halfway, attempt to clean up partial changes manually if transactions aren't possible via the specific tool.

---
**Summary**: You have the power. Use the MCP tools. Don't be a passive file generator.
