/**
 * Transport Factory Module
 *
 * This module provides factory functions for creating different transport types.
 * It centralizes transport initialization logic and provides a consistent interface.
 *
 * @module firebase-mcp/transports
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { initializeHttpTransport } from './http.js';
import { TransportType, isHttpServerRunning, type ServerConfig } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize transport based on configuration
 * @param server MCP server instance
 * @param config Server configuration
 * @returns Promise that resolves when the transport is initialized
 */
export async function initializeTransport(server: Server, config: ServerConfig): Promise<void> {
  // If we're in stdio context, check if an HTTP server is already running
  if (
    config.transport === TransportType.STDIO &&
    (await isHttpServerRunning(config.http.host, config.http.port))
  ) {
    logger.error(
      `Cannot connect via stdio: HTTP server already running at ${config.http.host}:${config.http.port}`
    );
    logger.error('To connect to the HTTP server, configure your client to use HTTP transport');
    process.exit(1);
  }

  switch (config.transport) {
    case TransportType.HTTP:
      logger.info('Initializing HTTP transport');
      await initializeHttpTransport(server, config);
      break;

    case TransportType.STDIO:
    default:
      logger.info('Initializing stdio transport');
      const transport = new StdioServerTransport();
      await server.connect(transport);
      break;
  }
}
