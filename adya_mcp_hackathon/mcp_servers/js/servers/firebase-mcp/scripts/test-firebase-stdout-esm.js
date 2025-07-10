/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Test script to verify if Firebase SDK is writing to stdout/stderr during listCollections()
 * Using ES modules
 */

// Import required modules
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to capture stdout and stderr
function captureOutput(callback) {
  return new Promise((resolve, reject) => {
    // Save original stdout and stderr write functions
    const originalStdoutWrite = process.stdout.write;
    const originalStderrWrite = process.stderr.write;

    // Create buffers to store captured output
    let stdoutOutput = '';
    let stderrOutput = '';

    // Override stdout and stderr write functions
    process.stdout.write = function (chunk, encoding, cb) {
      // Capture the output
      stdoutOutput += chunk.toString();
      // Call the original function
      return originalStdoutWrite.apply(process.stdout, arguments);
    };

    process.stderr.write = function (chunk, encoding, cb) {
      // Capture the output
      stderrOutput += chunk.toString();
      // Call the original function
      return originalStderrWrite.apply(process.stderr, arguments);
    };

    // Call the callback function
    Promise.resolve(callback())
      .then(result => {
        // Restore original stdout and stderr write functions
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;

        // Resolve with captured output and result
        resolve({ stdout: stdoutOutput, stderr: stderrOutput, result });
      })
      .catch(error => {
        // Restore original stdout and stderr write functions
        process.stdout.write = originalStdoutWrite;
        process.stderr.write = originalStderrWrite;

        // Reject with error
        reject(error);
      });
  });
}

async function main() {
  try {
    // Get service account path from environment variable or use default
    const serviceAccountPath =
      process.env.SERVICE_ACCOUNT_KEY_PATH || path.join(__dirname, 'firebaseServiceKey.json');

    console.log(`Using service account from: ${serviceAccountPath}`);

    // Read the service account file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // Initialize Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase initialized');

    // Capture output during listCollections call
    console.log('Capturing output during listCollections() call...');
    const { stdout, stderr, result } = await captureOutput(async () => {
      console.log('About to call listCollections()');
      const firestore = admin.firestore();
      const collections = await firestore.listCollections();
      console.log(`Got ${collections.length} collections`);
      return collections;
    });

    // Write captured output to files
    fs.writeFileSync('firebase-stdout.log', stdout);
    fs.writeFileSync('firebase-stderr.log', stderr);

    console.log(
      'Test complete. Check firebase-stdout.log and firebase-stderr.log for captured output.'

    // Log collection names
    const collectionNames = result.map(col => col.id);
    console.log('Collections:', collectionNames);

    // Search for specific patterns in the captured output
    const patterns = ['parent:', 'pageSize:', 'CallSettings', 'retry:'];
    const stdoutMatches = patterns.filter(pattern => stdout.includes(pattern));
    const stderrMatches = patterns.filter(pattern => stderr.includes(pattern));

    console.log('Patterns found in stdout:', stdoutMatches);
    console.log('Patterns found in stderr:', stderrMatches);

    // Write a summary report
    const report = `
Firebase SDK Output Test Report
==============================

Test Date: ${new Date().toISOString()}

Stdout Patterns Found:
${stdoutMatches.length > 0 ? stdoutMatches.join('\n') : 'None'}

Stderr Patterns Found:
${stderrMatches.length > 0 ? stderrMatches.join('\n') : 'None'}

Collections Found: ${collectionNames.join(', ')}

Conclusion: ${stdoutMatches.length > 0 || stderrMatches.length > 0 ?
        'Firebase SDK IS writing debug output to stdout/stderr during listCollections() call.' :
        'Firebase SDK is NOT writing debug output to stdout/stderr during listCollections() call.'}
`;

    fs.writeFileSync('firebase-test-report.txt', report);
    console.log('Report written to firebase-test-report.txt');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
