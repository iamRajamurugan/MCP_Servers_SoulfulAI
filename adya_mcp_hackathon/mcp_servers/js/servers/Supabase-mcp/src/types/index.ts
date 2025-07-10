import type { SupabaseClientOptions } from '@supabase/supabase-js';

/**
 * Configuration options for the SelfhostedSupabaseClient.
 */
export interface SelfhostedSupabaseClientOptions {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey?: string; // Optional, but needed for some operations like auto-creating helpers
    databaseUrl?: string; // Optional, but needed for direct DB access/transactions
    jwtSecret?: string; // Add JWT Secret
    supabaseClientOptions?: SupabaseClientOptions<"public">;
}

/**
 * Represents the structure of a successful SQL execution result via the RPC function.
 */
export type SqlSuccessResponse = Record<string, unknown>[];

/**
 * Represents the structure of an error during SQL execution.
 */
export interface SqlErrorResponse {
    error: {
        message: string;
        code?: string; // e.g., PostgreSQL error code
        details?: string;
        hint?: string;
    };
}

/**
 * Represents the result of an SQL execution, which can be success or error.
 */
export type SqlExecutionResult = SqlSuccessResponse | SqlErrorResponse;

// --- Core Data Structure Interfaces ---

/**
 * Represents a user object from the auth.users table.
 * Based on fields selected in listAuthUsersTool, getAuthUserTool etc.
 */
export interface AuthUser {
    id: string; // uuid
    email: string | null;
    role: string | null;
    created_at: string | null; // Timestamps returned as text from DB
    last_sign_in_at: string | null;
    raw_app_meta_data: Record<string, unknown> | null;
    raw_user_meta_data: Record<string, unknown> | null;
    // Add other relevant fields if needed, e.g., email_confirmed_at
}

/**
 * Represents a storage bucket from the storage.buckets table.
 */
export interface StorageBucket {
    id: string;
    name: string;
    owner: string | null;
    public: boolean;
    avif_autodetection: boolean;
    file_size_limit: number | null;
    allowed_mime_types: string[] | null;
    created_at: string | null; // Timestamps returned as text from DB
    updated_at: string | null;
}

/**
 * Represents a storage object from the storage.objects table.
 * Based on fields selected in listStorageObjectsTool.
 */
export interface StorageObject {
    id: string; // uuid
    name: string | null;
    bucket_id: string;
    owner: string | null; // uuid
    version: string | null;
    mimetype: string | null; // Extracted from metadata
    size: number | null;     // Extracted from metadata, parsed as number
    metadata: Record<string, unknown> | null; // Use unknown instead of any
    created_at: string | null; // Timestamps returned as text from DB
    updated_at: string | null;
    last_accessed_at: string | null;
} 