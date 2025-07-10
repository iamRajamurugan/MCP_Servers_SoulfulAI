# Notes for Minimal Selfhosted Supabase MCP Server

This document summarizes the findings and decisions made while attempting to adapt the official Supabase cloud MCP server for self-hosted use. The goal is to build a new, minimal server from scratch using these notes.

## Core Requirements

-   **Target:** Self-hosted Supabase instances.
-   **Scope:** Single project environment.
-   **Authentication:** Supabase URL and Anon Key required. Service Role Key optional (but recommended for certain operations like auto-creating helper functions).
-   **Configuration:** Server should accept URL/Keys via CLI arguments (e.g., using `commander`) or environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Also needs `DATABASE_URL` for direct DB fallback/transactions.

## Client Implementation (`SelfhostedSupabaseClient`)

-   **Primary Connection:** Use `@supabase/supabase-js` client initialized with user-provided URL and Anon Key.
-   **Core SQL Execution:**
    -   Prefer using a PostgreSQL RPC function (`public.execute_sql`) called via the Supabase JS client (`supabase.rpc(...)`). This leverages the existing connection pool and permissions.
    -   The client should check if this function exists on initialization. If not found (error code `42883`), and if the `serviceRoleKey` is available, attempt to create the function using a temporary service role client or the direct DB connection.
    -   **RPC Function SQL:**
        ```sql
        -- SQL to create the helper function
        CREATE OR REPLACE FUNCTION public.execute_sql(query text, read_only boolean DEFAULT false)
        RETURNS jsonb -- Using jsonb is generally preferred over json
        LANGUAGE plpgsql
        AS $$
        DECLARE
          result jsonb;
        BEGIN
          -- Note: SET TRANSACTION READ ONLY might not behave as expected within a function
          -- depending on the outer transaction state. Handle read-only logic outside if needed.

          -- Execute the dynamic query and aggregate results into a JSONB array
          EXECUTE 'SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM (' || query || ') t' INTO result;

          RETURN result;
        EXCEPTION
          WHEN others THEN
            -- Rethrow the error with context
            RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
        END;
        $$;

        -- Grant execution permission (run using service key or manually)
        GRANT EXECUTE ON FUNCTION public.execute_sql(text, boolean) TO authenticated;
        -- Optionally grant to anon if needed: GRANT EXECUTE ON FUNCTION public.execute_sql(text, boolean) TO anon;
        ```
-   **Fallback/Transactional SQL Execution:**
    -   Implement a secondary method (`executeSqlWithPg`) using the `pg` library (Node-postgres).
    -   This method requires the `DATABASE_URL` environment variable to be set for the direct connection string.
    -   Initialize the `pg.Pool` lazily on the first call to this method.
    -   Use this method as a fallback if the RPC call fails *after* initialization, or specifically for operations requiring transaction control (like `apply_migration`).
-   **Client Initialization:** The factory function (`createSelfhostedSupabaseClient`) should be `async` and perform the RPC check/create logic during an `await client.initialize()` step before returning the client instance.
-   **Type Safety:** Use specific types (`unknown`, `Record<string, unknown>`) instead of `any`. Leverage TypeScript type inference and define types for options and responses.

## Supported Tools

Based on analysis, the following tools are relevant for a self-hosted context:

*   **Database Operations:**
    *   `list_tables` (Uses `pg-meta` logic)
    *   `list_extensions` (Uses `pg-meta` logic)
    *   `list_migrations` (Queries `supabase_migrations.schema_migrations`)
    *   `apply_migration` (Executes DDL + inserts into `supabase_migrations.schema_migrations`; ideally uses `executeSqlWithPg` for transaction)
    *   `execute_sql` (Primary interface to `SelfhostedSupabaseClient.executeSql`)
*   **Debugging:**
    *   `get_logs` (Needs careful implementation; direct DB query of `pg_log` might be feasible but depends on setup. May need to be removed or simplified).
    *   `get_database_connections` (Queries `pg_stat_activity`)
    *   `get_database_stats` (Queries `pg_stat_*` views)
*   **Development & Configuration:**
    *   `get_project_url` (Returns configured URL)
    *   `get_anon_key` (Returns configured Anon Key)
    *   `get_service_key` (Returns configured Service Role Key)
    *   `generate_typescript_types` (Relies on DB introspection, potentially wrap `supabase gen types` or use `pg-meta`)
    *   `rebuild_hooks` (Interacts with `pg_net` if database webhooks are used)
    *   `verify_jwt_secret` (Useful for Auth debugging)
*   **Edge Functions (If Enabled):**
    *   `list_edge_functions`
    *   `deploy_edge_function`

## Removed Tools (Cloud-Specific)

The following tools from the original cloud server are not applicable and should *not* be implemented:

*   Project Management (`list_projects`, `create_project`, etc.)
*   Branching (`create_branch`, `list_branches`, etc.)
*   Cost Confirmation (`get_cost`, `confirm_cost`)

## Server Entry Point (`selfhosted-stdio.ts`)

-   Use `commander` for parsing CLI arguments (`--url`, `--anon-key`, etc.) and reading environment variables as fallbacks.
-   Implement an `async main()` function.
-   Call the `async createSelfhostedSupabaseClient` factory.
-   Create tool instances by passing the initialized `selfhostedClient` to tool generator functions (e.g., `getDatabaseOperationTools({ selfhostedClient, readOnly })`).
-   Initialize the MCP SDK (`@modelcontextprotocol/sdk`) with `stdio: true` and the combined dictionary of tool instances.
-   Include robust error handling for client initialization and server startup.

## Dependencies

-   **Core:** `@supabase/supabase-js`, `pg`, `zod`, `commander`, `@modelcontextprotocol/sdk`.
-   **Potential Native Dependency:** `libpg-query` (likely via `@supabase/sql-to-rest` or similar) might require C++ build tools (`node-gyp`, Visual Studio Desktop C++ workload on Windows) if pre-built binaries are unavailable for the target platform/Node version. Be mindful of this during setup.

## Useful Logic to Re-use

-   SQL generation logic from `packages/pg-meta` (e.g., `listTablesSql`, `listExtensionsSql`).
-   The `injectableTool` utility from `tools/util.ts` for structuring tool definitions with Zod schemas.

## Reason for Restart

Adapting the official cloud MCP server proved overly complex due to:
-   Deep integration with the multi-project/Management API paradigm.
-   Need for extensive refactoring of options and logic paths.
-   Inherited build complexities and dependencies not strictly necessary for a minimal self-hosted server.

Building from scratch allows for a cleaner, more focused implementation tailored specifically to the self-hosted use case. 