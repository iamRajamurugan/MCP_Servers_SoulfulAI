# About credentials

##### There is no need for any credentials,it is purely work on API calls.
**Tools used**:`resolve-library-id`: Resolves a general library name into a Context7-compatible library ID.
- `libraryName` (required): The name of the library to search for
- `get-library-docs`: Fetches documentation for a library using a Context7-compatible library ID.
- `context7CompatibleLibraryID` (required): Exact Context7-compatible library ID (e.g., `/mongodb/docs`, `/vercel/next.js`)
- `topic` (optional): Focus the docs on a specific topic (e.g., "routing", "hooks")
- `tokens` (optional, default 10000): Max number of tokens to return. Values less than the default value of 10000 are automatically increased to 10000.
[For more details](https://github.com/upstash/context7)
