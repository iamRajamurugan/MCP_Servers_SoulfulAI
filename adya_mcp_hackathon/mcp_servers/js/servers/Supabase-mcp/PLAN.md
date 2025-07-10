# Self-Hosted Supabase MCP Server - Implementation Plan

This plan outlines the steps to build the minimal self-hosted Supabase MCP server based on `migration_notes.md`.

## Progress Tracking

-   [x] Project Setup (package.json, tsconfig.json, dependencies, directories)
-   [ ] Define Core Types (`src/types/`)
-   [x] Implement `SelfhostedSupabaseClient` (`src/client/`)
    -   [x] Basic connection (`@supabase/supabase-js`)
    -   [x] RPC `execute_sql` function call logic
    -   [x] RPC function existence check and creation logic (using service key)
    -   [x] Direct DB connection fallback/transactional method (`pg`)
    -   [x] Async initialization logic (`client.initialize()`)
-   [x] Implement Server Entry Point (`src/index.ts`)
    -   [x] `commander` setup for args/env vars
    -   [x] `createSelfhostedSupabaseClient` factory usage
    -   [x] MCP SDK initialization (`stdio: true`)
    -   [x] Tool registration
    -   [x] Error handling
-   [x] Implement Tools (`src/tools/`)
    -   [x] **Schema & Migrations**
        -   [x] `list_tables`
        -   [x] `list_extensions`
        -   [x] `list_migrations`
        -   [x] `apply_migration`
    -   [x] **Database Operations & Stats**
        -   [x] `execute_sql`
        -   [x] `get_database_connections`
        -   [x] `get_database_stats`
    -   [x] **Project Configuration & Keys**
        -   [x] `get_project_url`
        -   [x] `get_anon_key`
        -   [x] `get_service_key`
        -   [x] `verify_jwt_secret`
    -   [x] **Development & Extension Tools**
        -   [x] `generate_typescript_types`
        -   [x] `rebuild_hooks`
    -   [-] `get_logs` (Skipped for now)
    -   [x] **Auth User Management**
        -   [x] `list_auth_users`
        -   [x] `get_auth_user`
        -   [x] `create_auth_user`
        -   [x] `delete_auth_user`
        -   [x] `update_auth_user`
    -   [x] **Storage Insights (Next)**
        -   [x] `list_storage_buckets`
        -   [x] `list_storage_objects`
    -   [x] **Realtime Inspection (Future)**
        -   [x] `list_realtime_publications`
    -   [ ] **Extension-Specific Tools (Future, if needed)**
        -   [ ] e.g., `list_cron_jobs` (for pg_cron)
        -   [ ] e.g., `get_vector_indexes` (for pgvector)
    -   [ ] **Edge Function Management (Optional/Future)**
        -   [ ] `list_edge_functions`
        -   [ ] `get_edge_function_details`
        -   [ ] `deploy_edge_function`
-   [ ] Add Basic README.md