import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ServerConfig, TransportType } from '../config';

// We'll mock process.exit in the individual tests

// Mock StdioServerTransport
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({
    onclose: null,
  })),
}));

// Mock HTTP transport
vi.mock('../transports/http.js', () => ({
  initializeHttpTransport: vi.fn().mockResolvedValue(undefined),
}));

// Mock config
vi.mock('../config.js', () => ({
  TransportType: { STDIO: 'stdio', HTTP: 'http' },
  isHttpServerRunning: vi.fn().mockResolvedValue(false),
}));

// Mock logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Transport Initialization', () => {
  let mockServer: Server;
  let config: ServerConfig;
  let initializeTransport: (server: Server, config: ServerConfig) => Promise<void>;
  let isHttpServerRunning: (host: string, port: number) => Promise<boolean>;
  let initializeHttpTransport: (server: Server, config: ServerConfig) => Promise<void>;
  let StdioServerTransport: any;
  let logger: any;

  beforeEach(async () => {
    // Reset modules and mocks
    vi.resetModules();
    vi.clearAllMocks();

    // Create mock server
    mockServer = {
      connect: vi.fn().mockResolvedValue(undefined),
    } as unknown as Server;

    // Create test config
    config = {
      serviceAccountKeyPath: '/path/to/service-account.json',
      storageBucket: 'test-bucket',
      transport: TransportType.STDIO,
      http: {
        port: 3000,
        host: 'localhost',
        path: '/mcp',
      },
      version: '1.0.0',
      name: 'test-server',
    };

    // Import mocked modules
    const configModule = await import('../config.js');
    const httpModule = await import('../transports/http.js');
    const stdioModule = await import('@modelcontextprotocol/sdk/server/stdio.js');
    const loggerModule = await import('../utils/logger.js');

    // Get mocked functions
    isHttpServerRunning = configModule.isHttpServerRunning as any;
    initializeHttpTransport = httpModule.initializeHttpTransport;
    StdioServerTransport = stdioModule.StdioServerTransport;
    logger = loggerModule.logger;

    // Import the module under test
    const transportModule = await import('../transports/index.js');
    initializeTransport = transportModule.initializeTransport;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize stdio transport by default', async () => {
    // Call the function
    await initializeTransport(mockServer, config);

    // Verify stdio transport was initialized
    expect(StdioServerTransport).toHaveBeenCalled();
    expect(mockServer.connect).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Initializing stdio transport');
  });

  it('should initialize HTTP transport when configured', async () => {
    // Update config to use HTTP transport
    config.transport = TransportType.HTTP;

    // Call the function
    await initializeTransport(mockServer, config);

    // Verify HTTP transport was initialized
    expect(initializeHttpTransport).toHaveBeenCalledWith(mockServer, config);
    expect(logger.info).toHaveBeenCalledWith('Initializing HTTP transport');
  });

  it('should exit if HTTP server is already running in stdio mode', async () => {
    // Mock isHttpServerRunning to return true
    (isHttpServerRunning as any).mockResolvedValueOnce(true);

    // Create a spy for process.exit
    const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called');
    }) as any);

    try {
      // Call the function
      await initializeTransport(mockServer, config);
    } catch (error) {
      // Ignore the error, we just want to check if process.exit was called
    }

    // Verify error was logged and process.exit was called
    expect(logger.error).toHaveBeenCalledWith(
      `Cannot connect via stdio: HTTP server already running at ${config.http.host}:${config.http.port}`
    );
    expect(logger.error).toHaveBeenCalledWith(
      'To connect to the HTTP server, configure your client to use HTTP transport'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    // Restore the original process.exit
    processExitSpy.mockRestore();
  });

  it('should not check for HTTP server if transport is HTTP', async () => {
    // Update config to use HTTP transport
    config.transport = TransportType.HTTP;

    // Call the function
    await initializeTransport(mockServer, config);

    // Verify isHttpServerRunning was not called
    expect(isHttpServerRunning).not.toHaveBeenCalled();
  });
});
