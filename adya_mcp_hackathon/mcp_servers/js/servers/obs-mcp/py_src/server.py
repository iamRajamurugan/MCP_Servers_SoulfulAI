#!/usr/bin/env python3

import asyncio
import logging
from mcp.server.fastmcp import FastMCP
from .client import OBSWebSocketClient

# Setup logging
logger = logging.getLogger("obs_server")

# Create a new event loop for the MCP server and client
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# Create a single FastMCP instance for the entire application
# The FastMCP will use the default event loop we just set
mcp = FastMCP("obs_mcp", description="OBS Studio MCP Server")

# Create a client with the same event loop
obs_client = OBSWebSocketClient(loop=loop)

# Log that the server was created
logger.debug("OBS MCP server created with dedicated event loop")