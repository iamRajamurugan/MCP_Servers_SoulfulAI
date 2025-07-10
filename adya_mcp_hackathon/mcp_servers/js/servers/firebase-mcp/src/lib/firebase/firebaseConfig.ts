/**
 * Firebase Configuration Module
 *
 * This module handles the initialization and configuration of Firebase Admin SDK.
 * It provides access to Firebase services like Firestore, Storage, and Authentication
 * through a centralized configuration. The module reads service account credentials
 * from the environment and initializes Firebase with appropriate settings.
 *
 * Environment variables used:
 * - SERVICE_ACCOUNT_KEY_PATH: Path to the Firebase service account key JSON file (required)
 * - FIREBASE_STORAGE_BUCKET: Custom bucket name for Firebase Storage (optional)
 *
 * @module firebase-mcp/config
 */

import * as admin from 'firebase-admin';
import fs from 'fs';

/**
 * Initializes the Firebase Admin SDK with service account credentials.
 * This function handles the complete initialization process including:
 * - Checking for existing Firebase app instances
 * - Reading service account credentials from the specified path
 * - Determining the project ID and storage bucket name
 * - Initializing the Firebase Admin SDK with appropriate configuration
 *
 * @returns {admin.app.App | null} Initialized Firebase admin app instance or null if initialization fails
 *
 * @example
 * // Initialize Firebase
 * const app = initializeFirebase();
 * if (app) {
 *   logger.info('Firebase initialized successfully');
 * } else {
 *   logger.error('Firebase initialization failed');
 * }
 */
function initializeFirebase(): admin.app.App | null {
  try {
    // Check if Firebase is already initialized to avoid duplicate initialization
    try {
      const existingApp = admin.app();
      if (existingApp) {
        return existingApp;
      }
    } catch {
      // No existing app, continue with initialization
    }

    // Get service account path from environment variables
    const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH;

    // Validate service account path is provided
    if (!serviceAccountPath) {
      return null;
    }

    try {
      // Read and parse the service account key file
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      const projectId = getProjectId(serviceAccountPath);

      // Validate project ID was found in the service account
      if (!projectId) {
        return null;
      }

      // Get bucket name from environment variable or use default format
      const storageBucket =
        process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

      // Initialize Firebase Admin SDK with the service account and storage configuration
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: storageBucket,
      });
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Extracts the project ID from a Firebase service account key file.
 * This function reads the specified service account file and extracts the project_id field.
 * If no path is provided, it attempts to use the SERVICE_ACCOUNT_KEY_PATH environment variable.
 *
 * @param {string} [serviceAccountPath] - Path to the service account key file
 * @returns {string} The Firebase project ID or an empty string if not found
 *
 * @example
 * // Get project ID from default service account path
 * const projectId = getProjectId();
 *
 * @example
 * // Get project ID from a specific service account file
 * const projectId = getProjectId('/path/to/service-account.json');
 */
function getProjectId(serviceAccountPath: string): string | null {
  // Use provided path or fall back to environment variable
  if (!serviceAccountPath) {
    return null;
  }

  try {
    // Read and parse the service account file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    return serviceAccount.project_id || null;
  } catch {
    return null;
  }
}

// Initialize Firebase and get Firestore instance
const adminApp = initializeFirebase();
const db = adminApp ? admin.firestore() : null;

// Export the initialized services and utility functions
export { db, admin, getProjectId, initializeFirebase };
