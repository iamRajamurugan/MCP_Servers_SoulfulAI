# Firebase MCP Server Installation Guide

This guide is specifically designed for AI agents like Cline to install and configure the Firebase MCP server for use with LLM applications like Claude Desktop, Cursor, Roo Code, and Cline.

## Prerequisites

Before installation, you need:

1. A Firebase project with necessary services enabled
2. Firebase service account key (JSON file)
3. Firebase Storage bucket name

## Installation Steps

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Project Settings > Service Accounts
3. Click "Generate new private key"
4. Save the JSON file securely
5. Note your Firebase Storage bucket name (usually `[projectId].appspot.com` or `[projectId].firebasestorage.app`)

### 2. Configure MCP Settings

Add the Firebase MCP server configuration to your MCP settings file based on your LLM client:

#### Configuration File Locations

- Cline (VS Code Extension): `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Roo Code (VS Code Extension): `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
- Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Cursor: `[project root]/.cursor/mcp.json`


Add this configuration to your chosen client's settings file:

```json
{
    "firebase-mcp": {
        "command": "npx",
        "args": [
            "-y",
            "@gannonh/firebase-mcp"
        ],
        "env": {
            "SERVICE_ACCOUNT_KEY_PATH": "/path/to/your/serviceAccountKey.json",
            "FIREBASE_STORAGE_BUCKET": "your-project-id.firebasestorage.app"
        },
        "disabled": false,
        "autoApprove": []
    }
}
```

### 3. Available Tools

Once installed, you'll have access to these Firebase tools:

#### Firestore Operations

- `firestore_add_document`: Add a document to a collection
- `firestore_list_collections`: List available collections
- `firestore_list_documents`: List documents with optional filtering
- `firestore_get_document`: Get a specific document
- `firestore_update_document`: Update an existing document
- `firestore_delete_document`: Delete a document

#### Authentication Operations

- `auth_get_user`: Get user details by ID or email

#### Storage Operations

- `storage_list_files`: List files in a directory
- `storage_get_file_info`: Get file metadata and download URL

### 4. Verify Installation

To verify the installation is working:

1. Restart your LLM application (Cline, Claude Desktop, etc.)
2. Test the connection by running a simple command like:
   ```
   Please list my Firestore collections using the firestore_list_collections tool
   ```

### Troubleshooting

1. If you see "Firebase is not initialized":
   - Verify your service account key path is correct and absolute
   - Check that the JSON file exists and is readable
   - Ensure the service account has necessary permissions

2. If you get "The specified bucket does not exist":
   - Verify Firebase Storage is enabled in your project
   - Check that the bucket name is correct
   - Try using the alternative bucket name format
   - Ensure the service account has Storage Admin role

3. For JSON parsing errors:
   - Make sure your MCP settings file is properly formatted
   - Verify all paths use forward slashes, even on Windows
   - Check for any missing commas or brackets in the configuration
