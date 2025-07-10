# Context7 MCP Server

**Context7** is an MCP (Model Context Protocol) server that delivers up-to-date, version-specific documentation and code examples directly into AI coding assistants, eliminating outdated references and hallucinated APIs.

Built and maintained by the Upstash team.

---

##  What is Context7?

- Pulls real-time docs and code examples directly from official sources, ensuring compatibility with your library versions. 
- Supports any LLM or AI code editor (Cursor, Windsurf, Claude Desktop, VS Code, etc.) via MCP.  
- Free for personal and educational use.

---

##  Key Features

### 1. **Version-Specific Documentation**
- Fetches docs tailored to the exact version of the library you're using, reducing errors from outdated info.

### 2. **Real, Working Code Examples**
- Includes clean, minimal examples sourced directly from official documentation.

### 3. **No Hallucinations or Filler**
- Filters out irrelevant XML/HTML noise or generic documentation text.

### 4. **Seamless MCP Integration**
- Just include “use context7” in your prompt, and Context7 fetches data automatically. 

### 5. **Supports Popular LLM IDEs**
- Works with Cursor, Windsurf, Claude Desktop, GitHub Copilot with MCP extension, VS Code, and more. 

### 6. **Library Resolution & Doc Search Tools**
- Offers tools like `resolve-library-uri` and `search-library-docs` for discovering relevant libraries/documentation. 

### 7. **MCP Server Methods**
- Supports streamable HTTP/SSE endpoints to fetch docs in real time.

### 8. **Centralized Documentation Repository**
- Indexes over 20,000 libraries with trust scoring and star ratings. 

### 9. **Optimized Retrieval Pipeline**
- Processes docs via parsing, enrichment (LLM-generated metadata), vectorization, reranking, and caching in Redis.

### 10. **Custom Library Support**
- Authors can submit their libraries or `context7.json` to customize indexing.

---

## Use Cases

- Avoid broken or outdated code due to LLM training cutoffs.
- Fetch accurate examples for frameworks (e.g., Next.js v15, Tailwind v4) that LLMs didn’t train on.  
- Improve LLM assistant output (Copilot, Cursor) with precise, relevant documentation context.
- Streamline development via topic-specific doc fetching and embedding via MCP integration. 

---


