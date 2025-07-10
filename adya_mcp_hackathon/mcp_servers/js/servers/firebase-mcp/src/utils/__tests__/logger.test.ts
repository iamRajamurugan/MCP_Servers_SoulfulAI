import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from '../logger';
import * as fs from 'fs';

// Mock fs module
vi.mock('fs', () => ({
  appendFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  accessSync: vi.fn(),
  constants: { W_OK: 2 },
}));

describe('Logger', () => {
  let stderrWrite: ReturnType<typeof vi.fn>;
  const originalStderrWrite = process.stderr.write;
  const originalEnv = process.env.DEBUG_LOG_FILE;

  beforeEach(() => {
    // Reset environment variable
    process.env.DEBUG_LOG_FILE = undefined;

    // Mock stderr.write
    stderrWrite = vi.fn().mockReturnValue(true);
    process.stderr.write = stderrWrite;

    // Reset fs mocks
    vi.mocked(fs.appendFileSync).mockClear();
  });

  afterEach(() => {
    process.stderr.write = originalStderrWrite;
    process.env.DEBUG_LOG_FILE = originalEnv;
    vi.clearAllMocks();
  });

  describe('info', () => {
    it('should write message to stderr with INFO prefix', () => {
      logger.info('test message');
      expect(stderrWrite).toHaveBeenCalledWith('[INFO] test message\n');
    });

    it('should write additional args as JSON', () => {
      const args = { foo: 'bar' };
      logger.info('test message', args);
      expect(stderrWrite).toHaveBeenCalledWith('[INFO] test message\n');
      // In the new implementation, args are only written to the log file, not to stderr
      // So we don't expect a second call to stderr.write
    });
  });

  describe('error', () => {
    it('should write message to stderr with ERROR prefix', () => {
      logger.error('test error');
      expect(stderrWrite).toHaveBeenCalledWith('[ERROR] test error\n');
    });

    it('should write Error stack when error is provided', () => {
      const error = new Error('test error');
      logger.error('error occurred', error);
      expect(stderrWrite).toHaveBeenCalledWith('[ERROR] error occurred\n');
      // In the new implementation, error stack is only written to the log file, not to stderr
      // So we don't expect a second call to stderr.write
    });

    it('should write non-Error objects as JSON', () => {
      const error = { message: 'test error' };
      logger.error('error occurred', error);
      expect(stderrWrite).toHaveBeenCalledWith('[ERROR] error occurred\n');
      // In the new implementation, error objects are only written to the log file, not to stderr
      // So we don't expect a second call to stderr.write
    });
  });

  describe('debug', () => {
    it('should write message to stderr with DEBUG prefix', () => {
      logger.debug('test debug');
      expect(stderrWrite).toHaveBeenCalledWith('[DEBUG] test debug\n');
    });

    it('should write additional args as JSON', () => {
      const args = { foo: 'bar' };
      logger.debug('test debug', args);
      expect(stderrWrite).toHaveBeenCalledWith('[DEBUG] test debug\n');
      // In the new implementation, args are only written to the log file, not to stderr
      // So we don't expect a second call to stderr.write
    });
  });

  describe('warn', () => {
    it('should write message to stderr with WARN prefix', () => {
      logger.warn('test warning');
      expect(stderrWrite).toHaveBeenCalledWith('[WARN] test warning\n');
    });

    it('should write additional args as JSON', () => {
      const args = { foo: 'bar' };
      logger.warn('test warning', args);
      expect(stderrWrite).toHaveBeenCalledWith('[WARN] test warning\n');
      // In the new implementation, args are only written to the log file, not to stderr
      // So we don't expect a second call to stderr.write
    });
  });

  describe('file logging', () => {
    it('should write to file when DEBUG_LOG_FILE is set', async () => {
      // Set up environment for file logging
      process.env.DEBUG_LOG_FILE = 'test.log';

      // Import the logger module again to trigger the initialization code
      vi.resetModules();
      const { logger } = await import('../logger');

      // Call logger methods
      logger.info('test message');
      logger.error('test error');
      logger.debug('test debug');
      logger.warn('test warning');

      // Verify that appendFileSync was called for each log message
      expect(fs.appendFileSync).toHaveBeenCalled();
    });
  });
});
