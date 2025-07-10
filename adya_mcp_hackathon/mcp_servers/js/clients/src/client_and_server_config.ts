export const ClientsConfig:any = [
    "MCP_CLIENT_OPENAI",
    "MCP_CLIENT_AZURE_AI",
    "MCP_CLIENT_GEMINI",
    // "CLAUDE",
]

export const ServersConfig:any = [
    {
        server_name :"WORDPRESS",
        server_features_and_capability:`WORDPRESS`,
        path : "build/index.js"
    },
    {
        server_name :"SALESFORCEMCP",
        server_features_and_capability:`SALESFORCE`,
        path : "dist/index.js"
    },
    {
        server_name :"context7",
        server_features_and_capability:`context7`,
        path : "dist/index.js"
    },
    {
        server_name :"obs-mcp",
        server_features_and_capability:`obs-mcp`,
        path : "build/index.js"
    },
    {
        server_name :"firebase-mcp",
        server_features_and_capability:`firebase-mcp`,
        path : "dist/index.js"
    },
    {
        server_name :"selfhosted-supabase-mcp",
        server_features_and_capability:`selfhosted-supabase-mcp`,
        path : "dist/index.js"
    }
    // {
    //     server_name :"WORDPRESS",
    //     server_features_and_capability:`WORDPRESS`,
    //     path : "build/index.js"
    // }
]

