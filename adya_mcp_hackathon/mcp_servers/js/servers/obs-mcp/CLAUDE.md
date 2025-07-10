# OBS-MCP Development Guidelines

## Build and Development Commands
- Build: `npm run build` - Compiles TypeScript and sets executable permissions
- Start: `npm run start` - Runs the MCP server for OBS Studio
- Python linting: `black py_src/` and `ruff check py_src/`

## Code Style Guidelines
### TypeScript
- **Imports**: ES modules with `.js` extensions in import paths
- **Formatting**: 2-space indentation, semicolons
- **Types**: Use strict TypeScript typing with interfaces, enums, and type annotations
- **Error Handling**: Wrap with try/catch blocks, include original error messages using pattern:
  `error instanceof Error ? error.message : String(error)`
- **Logging**: Use file logger instead of console.log

### Python
- **Formatting**: 4-space indentation, 100 character line length (configured in Black)
- **Type Hints**: Use Python typing module
- **Linting**: Black for formatting, Ruff for linting with E, F, B, I rule sets
- **Docstrings**: Include docstrings for all functions
- **Asyncio**: Use async/await for asynchronous operations

## Naming Conventions
- **Variables/Functions**: camelCase for TypeScript, snake_case for Python
- **Classes/Interfaces**: PascalCase
- **Constants**: UPPER_CASE or camelCase