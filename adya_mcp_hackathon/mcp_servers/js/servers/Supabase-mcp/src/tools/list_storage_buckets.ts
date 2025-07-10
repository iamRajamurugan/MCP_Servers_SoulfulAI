import { z } from 'zod';

import type { ToolContext } from './types.js';
import { handleSqlResponse } from './utils.js';
import type { SqlSuccessResponse, StorageBucket } from '../types/index.js';

// Zod schema for the bucket structure (Output Validation)
const BucketSchema = z.object({
    id: z.string(),
    name: z.string(),
    owner: z.string().nullable(),
    public: z.boolean(),
    avif_autodetection: z.boolean(),
    file_size_limit: z.number().nullable(),
    allowed_mime_types: z.array(z.string()).nullable(),
    // Keep timestamps as strings as returned by DB/pg
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
});

const ListStorageBucketsOutputSchema = z.array(BucketSchema);
type ListStorageBucketsOutput = StorageBucket[];

// Static JSON schema for MCP
export const mcpInputSchema = {
    type: 'object',
    properties: {},
    required: [],
};

// Zod schema for runtime input validation
const inputSchema = z.object({});
type Input = z.infer<typeof inputSchema>;

// Tool definition
export const listStorageBucketsTool = {
    name: 'list_storage_buckets',
    description: 'Lists all storage buckets in the project.',
    mcpInputSchema,
    inputSchema,
    outputSchema: ListStorageBucketsOutputSchema,

    execute: async (
        input: Input,
        context: ToolContext
    ): Promise<ListStorageBucketsOutput> => {
        const client = context.selfhostedClient;
        // Use console.error for operational logging
        console.error('Listing storage buckets...');

        // Check if direct DB connection is available, as it's likely needed for storage schema
        if (!client.isPgAvailable()) {
            // Log error for MCP client
            context.log('Direct database connection (DATABASE_URL) is required to list storage buckets.', 'error');
            throw new Error('Direct database connection (DATABASE_URL) is required to list storage buckets.');
        }

        const sql = `
            SELECT
                id,
                name,
                owner,
                public,
                avif_autodetection,
                file_size_limit,
                allowed_mime_types,
                created_at::text, -- Cast to text
                updated_at::text  -- Cast to text
            FROM storage.buckets;
        `;

        console.error('Attempting to list storage buckets using direct DB connection...');
        const result = await client.executeSqlWithPg(sql);

        // Validate and return using handler
        const validatedBuckets = handleSqlResponse(result, ListStorageBucketsOutputSchema);

        console.error(`Found ${validatedBuckets.length} buckets.`);
        context.log(`Found ${validatedBuckets.length} buckets.`); // Also log for MCP
        return validatedBuckets;
    },
};

// Default export for potential dynamic loading
export default listStorageBucketsTool; 