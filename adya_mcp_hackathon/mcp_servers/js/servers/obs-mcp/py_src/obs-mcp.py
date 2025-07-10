#!/usr/bin/env python3

import asyncio
import os
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("obs_mcp")

# Import the single MCP instance and client
from obs_mcp import mcp, obs_client

# Now import all tool modules
from obs_mcp import general
from obs_mcp import scenes
from obs_mcp import sources
from obs_mcp import scene_items
from obs_mcp import streaming
from obs_mcp import transitions

async def startup():
    """Connect to OBS WebSocket server on startup"""
    try:
        await obs_client.connect()
        logger.info("Connected to OBS WebSocket server")
    except Exception as e:
        logger.error(f"Failed to connect to OBS WebSocket server: {e}")
        logger.error("Make sure OBS is running and WebSocket server is enabled")
        logger.error("Will try to connect when the first request is made")

async def shutdown():
    """Close connection to OBS WebSocket server on shutdown"""
    await obs_client.close()
    logger.info("Disconnected from OBS WebSocket server")

if __name__ == "__main__":
    # Register startup and shutdown functions
    startup_task = asyncio.ensure_future(startup())
    asyncio.get_event_loop().run_until_complete(startup_task)
    mcp.run(transport='stdio')