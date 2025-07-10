#!/usr/bin/env python3

import os
import json
import asyncio
import websockets
import logging
from typing import Any, Dict, List, Optional, Union

OBS_WS_URL = "ws://localhost:4455"
OBS_WS_PASSWORD = os.environ.get("OBS_WS_PASSWORD", "")

# Setup logging
logger = logging.getLogger("obs_client")

class OBSWebSocketClient:
    def __init__(self, url: str = OBS_WS_URL, password: str = OBS_WS_PASSWORD, loop=None):
        self.url = url
        self.password = password
        self.ws = None
        self.message_id = 0
        self.authenticated = False
        self.loop = loop or asyncio.get_event_loop()
        self.lock = asyncio.Lock()
    
    async def connect(self):
        """Connect to OBS WebSocket server"""
        if self.ws:
            try:
                # Try a ping to see if connection is still alive
                pong = await self.ws.ping()
                await asyncio.wait_for(pong, timeout=2.0)
                return  # Connection is still good
            except Exception:
                # Connection is stale, close it and reconnect
                logger.info("Connection stale, reconnecting...")
                try:
                    await self.ws.close()
                except Exception:
                    pass
                self.ws = None
                self.authenticated = False
        
        try:
            logger.info(f"Connecting to OBS WebSocket at {self.url}")
            self.ws = await websockets.connect(self.url)
            await self._authenticate()
            logger.info("Successfully connected to OBS WebSocket server")
        except Exception as e:
            self.ws = None
            self.authenticated = False
            logger.error(f"Failed to connect to OBS WebSocket server: {e}")
            raise Exception(f"Failed to connect to OBS WebSocket server: {e}")

    async def _authenticate(self):
        """Authenticate with OBS WebSocket server"""
        # Receive hello message first
        hello = await self.ws.recv()
        hello_data = json.loads(hello)
        logger.debug(f"Received hello: {hello_data}")
        
        if hello_data["op"] != 0:  # Hello op code
            raise Exception("Did not receive Hello message from OBS WebSocket server")
        
        auth_data = {
            "op": 1,  # Identify op code
            "d": {
                "rpcVersion": 1,
                "authentication": self.password,
                "eventSubscriptions": 0  # We don't need events for now
            }
        }
        
        logger.debug("Sending authentication...")
        await self.ws.send(json.dumps(auth_data))
        response = await self.ws.recv()
        response_data = json.loads(response)
        logger.debug(f"Received auth response: {response_data}")
        
        if response_data["op"] != 2:  # Identified op code
            raise Exception("Authentication failed")
        
        self.authenticated = True
        logger.info("Successfully authenticated with OBS WebSocket server")

    async def send_request(self, request_type: str, request_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send a request to OBS WebSocket server and wait for response"""
        if not self.ws or not self.authenticated:
            await self.connect()
        
        request_id = str(self.message_id)
        self.message_id += 1
        
        payload = {
            "op": 6,  # Request op code
            "d": {
                "requestType": request_type,
                "requestId": request_id
            }
        }
        
        if request_data:
            payload["d"]["requestData"] = request_data
        
        logger.debug(f"Sending request {request_type} (ID: {request_id})")
        await self.ws.send(json.dumps(payload))
        
        # Wait for response with timeout
        start_time = self.loop.time()
        timeout = 5.0  # 5 seconds timeout
        
        while True:
            if self.loop.time() - start_time > timeout:
                logger.error(f"Timeout waiting for response to {request_type}")
                raise Exception(f"Timeout waiting for OBS WebSocket response for {request_type}")
            
            try:
                # Wait for response with small timeout to allow for cancellation
                response = await asyncio.wait_for(self.ws.recv(), 0.5)
                response_data = json.loads(response)
                
                # Check if this is our response
                if response_data["op"] == 7:  # RequestResponse op code
                    resp_id = response_data["d"]["requestId"]
                    
                    if resp_id == request_id:
                        # Check status
                        status = response_data["d"]["requestStatus"]
                        if not status["result"]:
                            error = status.get("comment", "Unknown error")
                            logger.error(f"Request {request_type} failed: {error}")
                            raise Exception(f"OBS WebSocket request failed: {error}")
                        
                        logger.debug(f"Received response for {request_type}")
                        return response_data["d"].get("responseData", {})
            except asyncio.TimeoutError:
                # Just continue waiting
                continue
            except Exception as e:
                if not isinstance(e, asyncio.TimeoutError):  # We handle timeout explicitly above
                    logger.error(f"Error waiting for response: {e}")
                    raise Exception(f"Error communicating with OBS WebSocket: {e}")

    async def close(self):
        """Close the connection to OBS WebSocket server"""
        if self.ws:
            logger.info("Closing connection to OBS WebSocket server")
            await self.ws.close()
            self.ws = None
            self.authenticated = False

# Don't create a singleton client here - it will be created in server.py
# obs_client = OBSWebSocketClient()