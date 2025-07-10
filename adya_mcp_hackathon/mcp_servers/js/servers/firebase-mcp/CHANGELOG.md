# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.5] - [1.4.9] 2025-05-10

### Fixed
-  fix: monkey-patch firebase-sdk - implement stdout filtering in Firestore client to prevent debug output interference
- fix: update error handling in Firestore client tests to return structured JSON error messages
- fix: enhance Firestore client error handling and ensure proper initialization of Firebase admin instance
- Improve Firestore collections listing by ensuring safe object creation and logging
- Changed response type assertion from 'json' to 'text' in Firestore client tests
- Improved Firestore collection listing with enhanced logging and response structure
- Updated version to 1.4.5 in package.json and package-lock.json
- Changed response type from 'json' to 'text' for Firestore collection operations

## [1.4.2] - 2025-05-08

### Fixed

- Fixed critical JSON parsing error in `firestore_list_collections` tool
- Added proper try/catch block to handle errors in collection listing
- Enhanced error reporting for Firestore collection operations
- Improved debug logging for collection listing operations

## [1.4.1] - 2025-05-08

### Fixed

- Fixed JSON parsing errors in tool responses by implementing consistent response formatting
- Enhanced all tool handlers to use explicit JSON sanitization with `JSON.stringify()`
- Added detailed debug logging for all tool responses to aid in troubleshooting
- Ensured consistent use of `type: 'text'` for all content responses
- Improved error handling and response formatting across all tools

## [1.4.0] - 2025-05-08

### Added

- Added streamable HTTP transport support as an alternative to stdio transport
- Implemented HTTP server transport with Express for handling MCP requests
- Added configuration options for HTTP port and host settings
- Enhanced logger utility with file logging capabilities
- Added support for debug log files with configurable paths
- Added environment variable support through dotenv integration
- Added comprehensive tests for HTTP transport functionality

### Changed

- Updated server initialization to support both stdio and HTTP transports
- Enhanced error handling for Firebase initialization in all client methods
- Updated module and moduleResolution options in tsconfig.json
- Improved TypeScript type safety across the codebase
- Enhanced ESLint configuration for better TypeScript support
- Upgraded @modelcontextprotocol/sdk from 1.8.0 to 1.11.0 for streamable HTTP support

### Fixed

- Improved error handling throughout the application
- Fixed type issues in Firestore query operations

## [1.3.5] - 2025-05-06

### Added

- Added Codecov integration for enhanced test coverage reporting and visualization

### Fixed

- Fixed TypeScript errors in `firestoreClient.test.ts` by using proper type assertions for filter operators and orderBy parameters

### Changed

- Updated dependencies to latest versions:
  - axios: ^1.8.4 → ^1.9.0
  - firebase-admin: ^13.2.0 → ^13.3.0
  - @types/node: ^22.14.0 → ^22.15.14
  - @typescript-eslint/eslint-plugin: ^8.29.1 → ^8.32.0
  - @typescript-eslint/parser: ^8.29.1 → ^8.32.0
  - @vitest/coverage-v8: ^3.1.1 → ^3.1.3
  - eslint: ^9.24.0 → ^9.26.0
  - eslint-config-prettier: ^9.1.0 → ^10.1.2
  - eslint-plugin-prettier: ^5.2.6 → ^5.4.0
  - typescript-eslint: ^8.30.2-alpha.5 → ^8.32.0
  - vitest: ^3.1.1 → ^3.1.3

## [1.3.4] - 2025-04-15

### Fixed

- Fixed Firestore timestamp handling issues:
  - Fixed inconsistency where timestamp objects were displayed as "[Object]" in responses
  - Added proper conversion of Firestore Timestamp objects to ISO strings
  - Enhanced timestamp filtering to work correctly with both server timestamps and ISO string dates
  - Implemented automatic conversion of ISO string dates to Firestore Timestamp objects when creating/updating documents
  - Improved query filtering to properly handle timestamp comparisons

## [1.3.3] - 2025-04-11

### Added

- New storage upload capabilities:
  - `storage_upload`: Upload files directly to Firebase Storage from text or base64 content
  - `storage_upload_from_url`: Upload files to Firebase Storage from external URLs
- **Permanent public URLs** for uploaded files that don't expire and work with public storage rules
- Support for direct local file path uploads - no need for Base64 conversion
- Improved guidance for all MCP clients on file upload best practices
- Automatic filename sanitization for better URL compatibility
- Response formatting metadata for MCP clients to display user-friendly file upload information
- Improved error handling for storage operations
- Automatic content type detection for uploaded files

### Fixed

- Fixed response format issues with storage tools to comply with MCP protocol standards
- Fixed image encoding issues to ensure uploaded images display correctly
- Improved error handling for invalid base64 data
- Enhanced MIME type detection for files uploaded from URLs

## [1.3.2] - 2024-04-10

### Added

- Added ESLint and Prettier for code quality and formatting
- Added lint and format scripts to package.json
- Added preflight script that runs formatting, linting, tests, and build in sequence
- Enhanced CI workflow to check code formatting and linting
- Added GitHub issues for new feature enhancements

### Fixed

- Fixed TypeScript errors in test files
- Fixed tests to work properly in emulator mode
- Excluded test files from production build
- Resolved lint warnings throughout the codebase

### Changed

- Updated CI workflow to use preflight script before publishing
- Modified test assertions to be more resilient in different environments
- Improved error handling in storage client tests

## [1.3.1] - 2024-04-08

### Fixed

- Fixed compatibility issues with Firebase Storage emulator
- Improved error handling in Firestore client

## [1.3.0] - 2024-04-05

### Added

- Added new `firestore_query_collection_group` tool to query documents across subcollections with the same name (commit [92b0548](https://github.com/gannonh/firebase-mcp/commit/92b0548))
- Implemented automatic extraction of Firebase console URLs for creating composite indexes when required (commit [cf9893b](https://github.com/gannonh/firebase-mcp/commit/cf9893b))

### Fixed

- Enhanced error handling for Firestore queries that require composite indexes (commit [cf9893b](https://github.com/gannonh/firebase-mcp/commit/cf9893b))
- Improved test validations to be more resilient to pre-existing test data (commit [cf9893b](https://github.com/gannonh/firebase-mcp/commit/cf9893b))

### Changed

- Updated README to specify 80%+ test coverage requirement for CI (commit [69a3e18](https://github.com/gannonh/firebase-mcp/commit/69a3e18))
- Updated `.gitignore` to exclude workspace configuration files (commit [ca42d0f](https://github.com/gannonh/firebase-mcp/commit/ca42d0f))

## [1.1.4] - 2024-04-01

### Changed

- Migrated test framework from Jest to Vitest
- Updated GitHub Actions CI workflow to use Vitest
- Enhanced test coverage, improving overall branch coverage from 77.84% to 85.05%
- Improved test stability in emulator mode, particularly for auth client tests

### Added

- Added tests for Firebase index error handling
- Added tests for data sanitization edge cases
- Added tests for pagination and document path support in Firestore
- Added additional error handling tests for Authentication client

### Fixed

- Fixed intermittent authentication test failures in emulator mode
- Fixed invalid pageToken test to properly handle error responses
- Resolved edge cases with unusual or missing metadata in storage tests

## [1.1.3] - 2024-04-01

### Fixed

- Support for Cursor
- Fixed Firestore `deleteDocument` function to properly handle non-existent documents
- Updated Auth client tests to handle dynamic UIDs from Firebase emulator
- Corrected logger import paths in test files
- Improved error handling in Firestore client tests
- Fixed Storage client tests to match current implementation

### Added

- Added proper error messages for non-existent documents in Firestore operations
- Enhanced test coverage for error scenarios in all Firebase services

### Changed

- Updated test suite to use Firebase emulator for consistent testing
- Improved logging in test files for better debugging
- Refactored test helper functions for better maintainability

## [1.1.2] - Previous version

- Initial release
