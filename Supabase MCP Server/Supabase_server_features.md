# Supabase MCP

***Let’s first understand what Supabase is.***

**Supabase** is an open-source Firebase alternative that provides a suite of tools for building modern web and mobile applications, including:

- **PostgreSQL database**, **Auth**, **Realtime subscriptions**, **Storage**, and **Edge Functions**
- Accessible via REST, GraphQL, or client SDKs
- Supabase MCP leverages this infrastructure to enable AI-powered assistants (like Claude or GPT) to perform database operations using **natural language** via MCP protocol.

---

## How is Supabase MCP Used?

- The **Supabase MCP Server** functions as the **MCP server**, exposing a natural language API for interacting with your Supabase backend.
- The **LLM (Large Language Model)** is the MCP **client** and the human-facing agent.
- This allows developers or users to:
  - Describe operations in plain language (*"Create a users table with email and name fields"*)
  - The LLM sends structured MCP calls (e.g., `supabase_create_table`)
  - The server translates them to Supabase API calls (via PostgREST or RPC)
  - Responses are returned in a structured, human-readable format

---

## MAIN FEATURES OF ***Supabase MCP***

### 1. Schema Exploration  
**Capability**: `supabase_list_tables`, `supabase_describe_table`  
**Description**: Lists available tables and provides detailed schema (columns, types, constraints, relationships).  
**Example**: *Show all columns in the `profiles` table*

---

### 2. Table Creation and Alteration  
**Capability**: `supabase_create_table`, `supabase_alter_table`  
**Description**: Enables LLMs to create or modify tables using natural language commands.  
**Example**: *Create a `feedback` table with `id`, `comment`, and `timestamp` fields*

---

### 3. Row-Level Security (RLS) Management  
**Capability**: `supabase_manage_rls_policy`  
**Description**: Allows enabling/disabling RLS and creating custom RLS policies to manage access control.  
**Example**: *Enable RLS on the `orders` table and allow only owners to read their orders*

---

### 4. CRUD Operations  
**Capability**: `supabase_crud_records`  
**Description**: Supports Create, Read, Update, and Delete operations on any table.  
**Example**: *Update all users with `is_active = false`*

---

### 5. Query with Filters and Sorting  
**Capability**: `supabase_query_table`  
**Description**: Performs advanced filtering, pagination, sorting, and searching using a natural language interface.  
**Example**: *Get the top 5 users ordered by signup date*

---

### 6. Auth Management  
**Capability**: `supabase_list_users`, `supabase_manage_user_roles`  
**Description**: Manages Supabase authentication users, their roles, and permissions.  
**Example**: *List all users with the role of `admin`*

---

### 7. RPC and Function Calls  
**Capability**: `supabase_call_function`  
**Description**: Triggers remote PostgreSQL stored procedures (RPC) using natural language queries.  
**Example**: *Call the `calculate_discount` function with `user_id = 123`*

---

### 8. Realtime Subscription Setup  
**Capability**: `supabase_subscribe_to_changes`  
**Description**: Configures live subscriptions to table changes and streams real-time events.  
**Example**: *Subscribe to all changes in the `messages` table*

---

### 9. File Storage Access  
**Capability**: `supabase_upload_file`, `supabase_list_files`, `supabase_download_file`  
**Description**: Manages Supabase Storage buckets, file uploads, downloads, and metadata queries.  
**Example**: *Upload a profile picture to the `avatars` bucket*

---

### 10. Metadata Introspection  
**Capability**: `supabase_inspect_metadata`  
**Description**: Gathers insights from table comments, tags, or configurations for smarter decision-making.  
**Example**: *Show the purpose of the `audit_logs` table*

---

