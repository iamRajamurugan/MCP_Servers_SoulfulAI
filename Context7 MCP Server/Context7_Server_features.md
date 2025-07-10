# Context7 MCP Server

**Context7** is an MCP (Model Context Protocol) server that delivers up-to-date, version-specific documentation and code examples directly into AI coding assistants, eliminating outdated references and hallucinated APIs.

Built and maintained by the Upstash team.

---

##  What is Context7?

- Pulls real-time docs and code examples directly from official sources, ensuring compatibility with your library versions. :contentReference[oaicite:1]{index=1}  
- Supports any LLM or AI code editor (Cursor, Windsurf, Claude Desktop, VS Code, etc.) via MCP. :contentReference[oaicite:2]{index=2}  
- Free for personal and educational use. :contentReference[oaicite:3]{index=3}

---

##  Key Features

### 1. **Version-Specific Documentation**
- Fetches docs tailored to the exact version of the library you're using, reducing errors from outdated info. :contentReference[oaicite:4]{index=4}

### 2. **Real, Working Code Examples**
- Includes clean, minimal examples sourced directly from official documentation. :contentReference[oaicite:5]{index=5}

### 3. **No Hallucinations or Filler**
- Filters out irrelevant XML/HTML noise or generic documentation text. :contentReference[oaicite:6]{index=6}

### 4. **Seamless MCP Integration**
- Just include “use context7” in your prompt, and Context7 fetches data automatically. :contentReference[oaicite:7]{index=7}

### 5. **Supports Popular LLM IDEs**
- Works with Cursor, Windsurf, Claude Desktop, GitHub Copilot with MCP extension, VS Code, and more. :contentReference[oaicite:8]{index=8}

### 6. **Library Resolution & Doc Search Tools**
- Offers tools like `resolve-library-uri` and `search-library-docs` for discovering relevant libraries/documentation. :contentReference[oaicite:9]{index=9}

### 7. **MCP Server Methods**
- Supports streamable HTTP/SSE endpoints to fetch docs in real time. :contentReference[oaicite:10]{index=10}

### 8. **Centralized Documentation Repository**
- Indexes over 20,000 libraries with trust scoring and star ratings. :contentReference[oaicite:11]{index=11}

### 9. **Optimized Retrieval Pipeline**
- Processes docs via parsing, enrichment (LLM-generated metadata), vectorization, reranking, and caching in Redis. :contentReference[oaicite:12]{index=12}

### 10. **Custom Library Support**
- Authors can submit their libraries or `context7.json` to customize indexing. :contentReference[oaicite:13]{index=13}

---

## Use Cases

- Avoid broken or outdated code due to LLM training cutoffs. :contentReference[oaicite:14]{index=14}  
- Fetch accurate examples for frameworks (e.g., Next.js v15, Tailwind v4) that LLMs didn’t train on. :contentReference[oaicite:15]{index=15}  
- Improve LLM assistant output (Copilot, Cursor) with precise, relevant documentation context. :contentReference[oaicite:16]{index=16}  
- Streamline development via topic-specific doc fetching and embedding via MCP integration. :contentReference[oaicite:17]{index=17}

---


