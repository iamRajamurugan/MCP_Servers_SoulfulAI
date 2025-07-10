/**
 * Firebase Authentication Client
 *
 * This module provides functions for interacting with Firebase Authentication.
 * It includes operations for user management and verification.
 *
 * @module firebase-mcp/auth
 */

import * as admin from 'firebase-admin';

interface AuthResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Retrieves user information from Firebase Authentication using either a user ID or email address.
 * The function automatically detects whether the identifier is an email address (contains '@')
 * or a user ID and uses the appropriate Firebase Auth method.
 *
 * @param {string} identifier - The user ID or email address to look up
 * @returns {Promise<AuthResponse>} A formatted response object containing the user information
 * @throws {Error} If the user cannot be found or if there's an authentication error
 *
 * @example
 * // Get user by email
 * const userInfo = await getUserByIdOrEmail('user@example.com');
 *
 * @example
 * // Get user by ID
 * const userInfo = await getUserByIdOrEmail('abc123xyz456');
 */
export async function getUserByIdOrEmail(identifier: string): Promise<AuthResponse> {
  try {
    let user: admin.auth.UserRecord;

    // Try to get user by email first
    if (identifier.includes('@')) {
      user = await admin.auth().getUserByEmail(identifier);
    } else {
      // If not an email, try by UID
      user = await admin.auth().getUser(identifier);
    }

    return {
      content: [{ type: 'json', text: JSON.stringify(user) }],
    };
  } catch {
    return {
      content: [{ type: 'error', text: `User not found: ${identifier}` }],
      isError: true,
    };
  }
}
