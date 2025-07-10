import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OBSWebSocketClient } from "./client.js";
import * as tools from "./tools/index.js";

// Create the OBS WebSocket client
const obsClient = new OBSWebSocketClient(
  process.env.OBS_WEBSOCKET_URL || "ws://localhost:4455",
  process.env.OBS_WEBSOCKET_PASSWORD || null
);

// Create the MCP server
export const server = new McpServer({
  name: "obs-mcp",
  version: "1.0.0",
});

export let serverConnected = false;

const logger = {
  log: (message: string) => console.error(message),
  error: (message: string) => console.error(message),
  debug: (message: string) => console.error(message),
};

// Set up server startup logic
export async function startServer() {
  try {

    // Initialize all tools with the OBS client
    await tools.initialize(server, obsClient);
    logger.log("Initialized MCP tools");

    // Connect the MCP server to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.log("OBS MCP Server running on stdio");

    serverConnected = true;

    // Connect to OBS WebSocket
    logger.log("Connecting to OBS WebSocket...");
    await obsClient.connect();
    logger.log("Connected to OBS WebSocket server");

    // Set up graceful shutdown
    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
  } catch (error) {
    logger.error(`Error starting server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function handleShutdown() {
  logger.log("Shutting down...");
  obsClient.disconnect();
  process.exit(0);
}

export { obsClient };