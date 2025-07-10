#!/usr/bin/env python3

import sys
import os
import logging
import asyncio

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("main")

# Check environment
if not os.environ.get("OBS_WS_PASSWORD"):
    logger.warning("OBS_WS_PASSWORD environment variable is not set.")
    logger.warning("You will need to set this to the WebSocket password configured in OBS.")
    logger.warning("Example: export OBS_WS_PASSWORD='your_password_here'")

# Run the server
if __name__ == "__main__":
    logger.info("Starting OBS MCP Server")
    
    try:
        # Import the shared event loop and server objects
        from obs_mcp.server import loop, mcp, obs_client
        
        # Connect to OBS WebSocket server before starting
        async def connect_to_obs():
            try:
                await obs_client.connect()
                logger.info("Connected to OBS WebSocket server")
            except Exception as e:
                logger.error(f"Failed to connect to OBS WebSocket server: {e}")
                logger.error("Make sure OBS is running and WebSocket server is enabled")
                logger.error("Will try to connect on first request")
        
        # Connect to OBS first
        connect_task = loop.create_task(connect_to_obs())
        loop.run_until_complete(connect_task)
        
        # Start the server
        logger.info("Starting MCP server...")
        mcp.run(transport='stdio')
        
    except Exception as e:
        logger.error(f"Error starting OBS MCP server: {e}")
        sys.exit(1)