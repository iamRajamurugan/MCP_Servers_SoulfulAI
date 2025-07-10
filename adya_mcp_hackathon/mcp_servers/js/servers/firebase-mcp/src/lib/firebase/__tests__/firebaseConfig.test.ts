import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// import type * as adminTypes from 'firebase-admin';

// Mock fs module
vi.mock('fs', () => {
  return {
    readFileSync: vi.fn(),
  };
});

// Mock firebase-admin module
vi.mock('firebase-admin', () => {
  return {
    app: vi.fn(),
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn().mockReturnValue('mock-credential'),
    },
    firestore: vi.fn().mockReturnValue({ collection: vi.fn() }),
  };
});

// Import after mocking
import { getProjectId, initializeFirebase } from '../../firebase/firebaseConfig';
import * as fs from 'fs';
import * as admin from 'firebase-admin';

describe('Firebase Config', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.SERVICE_ACCOUNT_KEY_PATH;
    delete process.env.FIREBASE_STORAGE_BUCKET;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjectId', () => {
    it('should return null when service account path is not provided', () => {
      const result = getProjectId('');
      expect(result).toBeNull();
    });

    it('should handle invalid service account data', () => {
      // Test case 1: File read throws error
      vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      let result = getProjectId('/path/to/nonexistent.json');
      expect(result).toBeNull();

      // Test case 2: Invalid JSON
      vi.mocked(fs.readFileSync).mockReturnValueOnce('{ invalid json }');

      result = getProjectId('/path/to/invalid.json');
      expect(result).toBeNull();

      // Test case 3: Missing project_id
      vi.mocked(fs.readFileSync).mockReturnValueOnce(
        JSON.stringify({
          type: 'service_account',
          client_email: 'test@example.com',
        })
      );

      result = getProjectId('/path/to/no-project-id.json');
      expect(result).toBeNull();
    });
  });

  describe('initializeFirebase', () => {
    it('should return existing app if already initialized', () => {
      const mockExistingApp = { name: 'existing-app' };
      vi.mocked(admin.app).mockReturnValueOnce(mockExistingApp as any);

      const result = initializeFirebase();

      expect(result).toBe(mockExistingApp);
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });

    it('should handle invalid/missing configuration', () => {
      // Mock admin.app to throw (no existing app)
      vi.mocked(admin.app).mockImplementation(() => {
        throw new Error('No app exists');
      });

      // Case 1: No SERVICE_ACCOUNT_KEY_PATH
      let result = initializeFirebase();
      expect(result).toBeNull();

      // Case 2: SERVICE_ACCOUNT_KEY_PATH set but file read fails
      process.env.SERVICE_ACCOUNT_KEY_PATH = '/path/to/service-account.json';
      vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      result = initializeFirebase();
      expect(result).toBeNull();

      // Case 3: File exists but no project_id
      vi.mocked(fs.readFileSync).mockReturnValueOnce(
        JSON.stringify({
          type: 'service_account',
          client_email: 'test@example.com',
          // No project_id
        })
      );

      result = initializeFirebase();
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors in initializeFirebase', () => {
      // Mock admin.app to throw (no existing app)
      vi.mocked(admin.app).mockImplementation(() => {
        throw new Error('No app exists');
      });

      // Set SERVICE_ACCOUNT_KEY_PATH
      process.env.SERVICE_ACCOUNT_KEY_PATH = '/path/to/service-account.json';

      // Mock fs.readFileSync to return invalid JSON
      vi.mocked(fs.readFileSync).mockReturnValueOnce('{ invalid json }');

      // Call the function
      const result = initializeFirebase();

      // Verify the result
      expect(result).toBeNull();
    });
  });
});
