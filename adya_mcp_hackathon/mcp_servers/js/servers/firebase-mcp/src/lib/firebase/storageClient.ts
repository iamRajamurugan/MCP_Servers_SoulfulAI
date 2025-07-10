/**
 * Firebase Storage Client
 *
 * This module provides functions for interacting with Firebase Storage.
 * It includes operations for listing files in directories and retrieving file metadata.
 * All functions handle bucket name resolution and return data in a format compatible
 * with the MCP protocol response structure.
 *
 * @module firebase-mcp/storage
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
// Firebase admin is imported dynamically in getBucket
import { logger } from '../../utils/logger.js';

/**
 * Detects content type from file path or data URL
 *
 * @param {string} input - The file path or data URL
 * @returns {string} The detected content type
 */
export function detectContentType(input: string): string {
  // Handle data URLs
  if (input.startsWith('data:')) {
    const matches = input.match(/^data:([\w-+\/]+)(?:;[\w-]+=([\w-]+))*(?:;(base64))?,.*$/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
    return 'text/plain';
  }

  // Handle file extensions
  const extension = input.split('.').pop()?.toLowerCase();
  if (!extension) {
    return 'text/plain';
  }

  const mimeTypes: Record<string, string> = {
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    csv: 'text/csv',
    md: 'text/markdown',
    yaml: 'application/yaml',
    yml: 'application/yaml',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    ico: 'image/x-icon',
    ttf: 'font/ttf',
    woff: 'font/woff',
    woff2: 'font/woff2',
    eot: 'application/vnd.ms-fontobject',
    otf: 'font/otf',
    zip: 'application/zip',
    xml: 'application/xml',
  };

  return mimeTypes[extension] || 'text/plain';
}

/**
 * Sanitizes a file path for better URL compatibility
 *
 * @param {string} filePath - The original file path
 * @returns {string} The sanitized file path
 */
export function sanitizeFilePath(filePath: string | undefined | null): string {
  // Handle null or undefined values
  if (!filePath) {
    return '';
  }

  // Replace spaces with hyphens
  let sanitized = filePath.replace(/\s+/g, '-');

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // Replace special characters with hyphens (except for periods, slashes, and underscores)
  sanitized = sanitized.replace(/[^a-z0-9\.\/\_\-]/g, '-');

  // Remove multiple consecutive hyphens
  sanitized = sanitized.replace(/\-+/g, '-');

  // Log if the path was changed
  if (sanitized !== filePath) {
    logger.info(`File path sanitized for better URL compatibility: "${filePath}" → "${sanitized}"`);
  }

  return sanitized;
}

/**
 * Generate a permanent public URL for a file in Firebase Storage
 *
 * @param {string} bucketName - The name of the storage bucket
 * @param {string} filePath - The path to the file in storage
 * @returns {string} A permanent public URL for the file
 */
export function getPublicUrl(bucketName: string, filePath: string): string {
  // Encode the file path properly for URLs
  const encodedFilePath = encodeURIComponent(filePath);

  // Return the permanent URL without a token
  // This format works for public files and doesn't expire
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFilePath}?alt=media`;
}

//const storage = admin.storage().bucket();

/**
 * Interface for Firebase Storage File objects
 */
interface StorageFile {
  name: string;
  metadata: Record<string, unknown>;
  exists(): Promise<[boolean]>;
  getMetadata(): Promise<[Record<string, unknown>]>;
  getSignedUrl(options: { action: string; expires: number }): Promise<[string]>;
  save(buffer: Buffer, options?: unknown): Promise<void>;
}

/**
 * Interface for Firebase Storage Bucket objects
 * This is a simplified version of the actual Firebase Bucket type
 * that includes only the properties and methods we use
 */
interface StorageBucket {
  name: string;
  file(path: string): StorageFile;
  getFiles(options?: {
    prefix?: string;
    delimiter?: string;
    maxResults?: number;
    pageToken?: string;
  }): Promise<[StorageFile[], string | null]>;
}

/**
 * Standard response type for all Storage operations.
 * This interface defines the structure of responses returned by storage functions,
 * conforming to the MCP protocol requirements.
 *
 * @interface StorageResponse
 * @property {Array<{type: string, text: string}>} content - Array of content items to return to the client
 * @property {boolean} [isError] - Optional flag indicating if the response represents an error
 */
interface StorageResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Gets the correct bucket name for Firebase Storage operations.
 * This function tries multiple approaches to determine the bucket name:
 * 1. Uses the FIREBASE_STORAGE_BUCKET environment variable if available
 * 2. Falls back to standard bucket name formats based on the project ID
 *
 * @param {string} projectId - The Firebase project ID
 * @returns {string} The resolved bucket name to use for storage operations
 *
 * @example
 * // Get bucket name for a project
 * const bucketName = getBucketName('my-firebase-project');
 */
export function getBucketName(projectId: string): string {
  // Get bucket name from environment variable or use default format
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (storageBucket) {
    logger.debug(`Using bucket name from environment: ${storageBucket}`);
    return storageBucket;
  }

  // Special handling for emulator environment
  const isEmulator =
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
    process.env.USE_FIREBASE_EMULATOR === 'true' ||
    process.env.NODE_ENV === 'test';

  if (isEmulator) {
    logger.debug(`Using emulator bucket format for project: ${projectId}`);
    return `${projectId}.firebasestorage.app`;
  }

  // Try different bucket name formats as fallbacks
  const possibleBucketNames = [
    `${projectId}.firebasestorage.app`,
    `${projectId}.appspot.com`,
    projectId,
  ];

  logger.warn(
    `No FIREBASE_STORAGE_BUCKET environment variable set. Trying default bucket names: ${possibleBucketNames.join(', ')}`
  );
  logger.debug(`Using first bucket name as fallback: ${possibleBucketNames[0]}`);
  return possibleBucketNames[0]; // Default to first format
}

export async function getBucket(): Promise<StorageBucket | null> {
  try {
    logger.debug('getBucket called');

    // Import Firebase admin directly
    // This is a workaround for the import style mismatch
    const adminModule = await import('firebase-admin');
    logger.debug('Imported firebase-admin module directly');

    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
      logger.error('FIREBASE_STORAGE_BUCKET not set in getBucket');
      return null;
    }
    logger.debug(`Storage bucket from env: ${storageBucket}`);

    try {
      // Get the storage instance
      const storage = adminModule.default.storage();
      logger.debug(`Storage object obtained: ${storage ? 'yes' : 'no'}`);

      // Get the bucket
      logger.debug(`Getting bucket with name: ${storageBucket}`);
      const bucket = storage.bucket(storageBucket);
      logger.debug(`Got bucket reference: ${bucket.name}`);
      // Use type assertion to match our simplified interface
      return bucket as unknown as StorageBucket;
    } catch (error) {
      logger.error(
        `Error getting storage bucket: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return null;
    }
  } catch (error) {
    logger.error(`Error in getBucket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Lists files and directories in a specified path in Firebase Storage.
 * Results are paginated and include download URLs for files and console URLs for directories.
 *
 * @param {string} [directoryPath] - The path to list files from (e.g., 'images/' or 'documents/2023/')
 *                          If not provided, lists files from the root directory
 * @param {number} [pageSize=10] - Number of items to return per page
 * @param {string} [pageToken] - Token for pagination to get the next page of results
 * @returns {Promise<StorageResponse>} MCP-formatted response with file and directory information
 * @throws {Error} If Firebase is not initialized or if there's a Storage error
 *
 * @example
 * // List files in the root directory
 * const rootFiles = await listDirectoryFiles();
 *
 * @example
 * // List files in a specific directory with pagination
 * const imageFiles = await listDirectoryFiles('images', 20);
 * // Get next page using the nextPageToken from the previous response
 * const nextPage = await listDirectoryFiles('images', 20, response.nextPageToken);
 */
export async function listDirectoryFiles(
  directoryPath: string = '',
  pageSize: number = 10,
  pageToken?: string
): Promise<StorageResponse> {
  try {
    const bucket = await getBucket();
    if (!bucket) {
      return {
        content: [{ type: 'error', text: 'Storage bucket not available' }],
        isError: true,
      };
    }

    const prefix = directoryPath ? `${directoryPath.replace(/\/*$/, '')}/` : '';
    const [files, nextPageToken] = await bucket.getFiles({
      prefix,
      maxResults: pageSize,
      pageToken,
    });

    const fileList = files.map((file: { name: string; metadata: Record<string, unknown> }) => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      updated: file.metadata.updated,
      downloadUrl: file.metadata.mediaLink,
    }));

    return {
      content: [{ type: 'text', text: JSON.stringify({ files: fileList, nextPageToken }) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'error', text: `Error listing files: ${errorMessage}` }],
      isError: true,
    };
  }
}

/**
 * Retrieves detailed information about a specific file in Firebase Storage.
 * Returns file metadata and a signed download URL with 1-hour expiration.
 *
 * @param {string} filePath - The complete path to the file in storage (e.g., 'images/logo.png')
 * @returns {Promise<StorageResponse>} MCP-formatted response with file metadata and download URL
 * @throws {Error} If Firebase is not initialized, if the file doesn't exist, or if there's a Storage error
 *
 * @example
 * // Get information about a specific file
 * const fileInfo = await getFileInfo('documents/report.pdf');
 */
export async function getFileInfo(filePath: string): Promise<StorageResponse> {
  try {
    const bucket = await getBucket();
    if (!bucket) {
      return {
        content: [{ type: 'error', text: 'Storage bucket not available' }],
        isError: true,
      };
    }

    const file = bucket.file(filePath);
    const [exists] = await file.exists();

    if (!exists) {
      return {
        content: [{ type: 'error', text: `File not found: ${filePath}` }],
        isError: true,
      };
    }

    const [metadata] = await file.getMetadata();

    // Generate both permanent and temporary URLs
    const publicUrl = getPublicUrl(bucket.name, filePath);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
    });

    const fileInfo = {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType,
      updated: metadata.updated,
      downloadUrl: publicUrl, // Use the permanent URL as the primary download URL
      temporaryUrl: signedUrl, // Include the temporary URL as a backup
      bucket: bucket.name,
      path: filePath,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(fileInfo) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'error', text: `Error getting file info: ${errorMessage}` }],
      isError: true,
    };
  }
}

/**
 * Uploads a file to Firebase Storage from content (text, base64, etc.)
 *
 * @param {string} filePath - The destination path in Firebase Storage
 * @param {string} content - The file content (text or base64 encoded data) or a local file path
 * @param {string} [contentType] - Optional MIME type. If not provided, it will be inferred
 * @param {object} [metadata] - Optional additional metadata
 * @returns {Promise<StorageResponse>} MCP-formatted response with file info
 * @throws {Error} If Firebase is not initialized or if there's a Storage error
 *
 * @example
 * // Upload a text file
 * const result = await uploadFile('logs/info.txt', 'Log content here', 'text/plain');
 *
 * @example
 * // Upload from base64
 * const result = await uploadFile('images/logo.png', 'data:image/png;base64,iVBORw0...');
 *
 * @example
 * // Upload from a local file path
 * const result = await uploadFile('images/logo.png', '/path/to/local/image.png');
 */
export async function uploadFile(
  filePath: string,
  content: string,
  contentType?: string,
  metadata?: Record<string, unknown>
): Promise<StorageResponse> {
  // Sanitize the file path for better URL compatibility
  filePath = sanitizeFilePath(filePath);
  try {
    logger.debug(`Uploading file to: ${filePath}`);

    // Get the bucket using the regular method
    const bucket = await getBucket();
    if (!bucket) {
      return {
        content: [{ type: 'error', text: 'Storage bucket not available' }],
        isError: true,
      };
    }

    let buffer: Buffer;
    let detectedContentType = contentType;

    // Handle base64 data URLs
    if (content.startsWith('data:')) {
      // More flexible regex to handle various data URL formats
      const matches = content.match(/^data:([\w-+\/]+)(?:;[\w-]+=([\w-]+))*(?:;(base64))?,(.*)$/);

      if (matches) {
        // If content type not provided, use the one from data URL
        if (!detectedContentType && matches[1]) {
          detectedContentType = matches[1].trim();
        }

        // Check if this is base64 encoded
        const isBase64 = matches[3] === 'base64';
        const data = matches[4] || '';

        try {
          // Extract data and convert to buffer
          if (isBase64) {
            // Validate base64 data before processing
            // Check if the base64 string is valid and not truncated
            const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(data);

            if (!isValidBase64) {
              // Try to repair common base64 issues
              let repairedData = data;

              // Remove any non-base64 characters
              repairedData = repairedData.replace(/[^A-Za-z0-9+/=]/g, '');

              // Ensure proper padding
              const paddingNeeded = (4 - (repairedData.length % 4)) % 4;
              repairedData += '='.repeat(paddingNeeded);

              try {
                // Try with the repaired data
                buffer = Buffer.from(repairedData, 'base64');

                // If we get here, the repair worked
                logger.debug('Base64 data was repaired successfully');
              } catch {
                return {
                  content: [
                    {
                      type: 'error',
                      text: `Invalid base64 data: The data appears to be truncated or corrupted. LLMs like Claude sometimes have issues with large base64 strings. Try using a local file path or URL instead.`,
                    },
                  ],
                  isError: true,
                };
              }
            } else {
              // Handle valid base64 data
              buffer = Buffer.from(data, 'base64');
            }
          } else {
            // Handle URL-encoded data
            buffer = Buffer.from(decodeURIComponent(data));
          }

          // Validate buffer for images
          if (
            detectedContentType &&
            detectedContentType.startsWith('image/') &&
            buffer.length < 10
          ) {
            return {
              content: [
                { type: 'error', text: 'Invalid image data: too small to be a valid image' },
              ],
              isError: true,
            };
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'error',
                text: `Invalid data encoding: ${error instanceof Error ? error.message : 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }
      } else {
        return {
          content: [{ type: 'error', text: 'Invalid data URL format' }],
          isError: true,
        };
      }
    } else if (content.startsWith('/antml:document') || content.includes('document reference')) {
      // Handle document references that can't be directly accessed
      return {
        content: [
          {
            type: 'error',
            text: `‼️ Document references cannot be directly accessed by external tools. ‼️

Instead, please use one of these approaches:

1. Use a direct file path to the document on your system (fastest and most reliable):
   Example: '/Users/username/Downloads/document.pdf'

2. Upload the file to a web location and use storage_upload_from_url:
   Example: 'https://example.com/document.pdf'

3. For text files, extract the content and upload it as plain text.

‼️ Path-based uploads work great for all file types and are extremely fast. ‼️`,
          },
        ],
        isError: true,
      };
    } else if (content.startsWith('/') && fs.existsSync(content)) {
      // Handle local file paths - NEW FEATURE
      try {
        // Read the file as binary
        buffer = fs.readFileSync(content);

        // If content type not provided, try to detect from file extension
        if (!detectedContentType) {
          const extension = path.extname(content).toLowerCase().substring(1);
          const mimeTypes: Record<string, string> = {
            txt: 'text/plain',
            html: 'text/html',
            css: 'text/css',
            js: 'application/javascript',
            json: 'application/json',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            svg: 'image/svg+xml',
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            csv: 'text/csv',
            md: 'text/markdown',
          };
          detectedContentType = mimeTypes[extension] || 'application/octet-stream';
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'error',
              text: `Error reading local file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    } else {
      // Treat as plain text if not a data URL or local file
      buffer = Buffer.from(content);

      // Default to text/plain if content type not provided
      if (!detectedContentType) {
        detectedContentType = 'text/plain';
      }
    }

    // Create file reference
    const file = bucket.file(filePath);

    // Prepare upload options
    const options = {
      metadata: {
        contentType: detectedContentType,
        metadata: metadata || {},
      },
    };

    // Upload file
    await file.save(buffer, options);

    // Get file info including download URL
    const [fileMetadata] = await file.getMetadata();

    // Generate both permanent and temporary URLs
    const publicUrl = getPublicUrl(bucket.name, filePath);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
    });

    const fileInfo = {
      name: fileMetadata.name,
      size: fileMetadata.size,
      contentType: fileMetadata.contentType,
      updated: fileMetadata.updated,
      downloadUrl: publicUrl, // Use the permanent URL as the primary download URL
      temporaryUrl: signedUrl, // Include the temporary URL as a backup
      bucket: bucket.name,
      path: filePath,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(fileInfo) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'error', text: `Error uploading file: ${errorMessage}` }],
      isError: true,
    };
  }
}

/**
 * Uploads a file to Firebase Storage from an external URL
 *
 * @param {string} filePath - The destination path in Firebase Storage
 * @param {string} url - The source URL to download from
 * @param {string} [contentType] - Optional MIME type. If not provided, it will be inferred from response headers
 * @param {object} [metadata] - Optional additional metadata
 * @returns {Promise<StorageResponse>} MCP-formatted response with file info
 * @throws {Error} If Firebase is not initialized, if the URL is invalid, or if there's a Storage error
 *
 * @example
 * // Upload a file from URL
 * const result = await uploadFileFromUrl('documents/report.pdf', 'https://example.com/report.pdf');
 */
export async function uploadFileFromUrl(
  filePath: string,
  url: string,
  contentType?: string,
  metadata?: Record<string, unknown>
): Promise<StorageResponse> {
  // Sanitize the file path for better URL compatibility
  filePath = sanitizeFilePath(filePath);
  try {
    const bucket = await getBucket();
    if (!bucket) {
      return {
        content: [{ type: 'error', text: 'Storage bucket not available' }],
        isError: true,
      };
    }

    // Fetch file from URL
    try {
      // Set appropriate response type and headers based on expected content
      const isImage = url.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) !== null;
      const responseType = 'arraybuffer'; // Always use arraybuffer for binary data

      const response = await axios.get(url, {
        responseType: responseType,
        headers: {
          // Accept any content type, but prefer binary for images
          Accept: isImage ? 'image/*' : '*/*',
        },
      });

      // Use provided content type or get from response headers
      let detectedContentType =
        contentType || response.headers['content-type'] || 'application/octet-stream';

      // For images without content type, try to detect from URL extension
      if (!detectedContentType.includes('/') && isImage) {
        const extension = url.split('.').pop()?.toLowerCase();
        if (extension) {
          const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            bmp: 'image/bmp',
            webp: 'image/webp',
            svg: 'image/svg+xml',
          };
          detectedContentType = mimeTypes[extension] || detectedContentType;
        }
      }

      // Create buffer from response data
      const buffer = Buffer.from(response.data);

      // Validate buffer for images
      if (detectedContentType.startsWith('image/') && buffer.length < 10) {
        return {
          content: [
            {
              type: 'error',
              text: 'Invalid image data: downloaded file is too small to be a valid image',
            },
          ],
          isError: true,
        };
      }

      // Create file reference
      const file = bucket.file(filePath);

      // Prepare upload options
      const options = {
        metadata: {
          contentType: detectedContentType,
          metadata: {
            ...metadata,
            sourceUrl: url,
          },
        },
      };

      // Upload file
      await file.save(buffer, options);

      // Get file info including download URL
      const [fileMetadata] = await file.getMetadata();

      // Generate both permanent and temporary URLs
      const publicUrl = getPublicUrl(bucket.name, filePath);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      });

      const fileInfo = {
        name: fileMetadata.name,
        size: fileMetadata.size,
        contentType: fileMetadata.contentType,
        updated: fileMetadata.updated,
        downloadUrl: publicUrl, // Use the permanent URL as the primary download URL
        temporaryUrl: signedUrl, // Include the temporary URL as a backup
        sourceUrl: url,
        bucket: bucket.name,
        path: filePath,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(fileInfo) }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{ type: 'error', text: `Error fetching or processing URL: ${errorMessage}` }],
        isError: true,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'error', text: `Error uploading file from URL: ${errorMessage}` }],
      isError: true,
    };
  }
}
