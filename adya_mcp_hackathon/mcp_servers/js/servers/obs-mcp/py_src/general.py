#!/usr/bin/env python3

from typing import Any, Dict, List, Optional

from .client import obs_client
from .server import mcp

@mcp.tool()
async def get_version() -> Dict[str, Any]:
    """
    Gets data about the current plugin and RPC version.
    
    Returns:
        Dict containing OBS version information including obsVersion, 
        obsWebSocketVersion, rpcVersion, and available requests list
    """
    return await obs_client.send_request("GetVersion")

@mcp.tool()
async def get_stats() -> Dict[str, Any]:
    """
    Gets statistics about OBS, obs-websocket, and the current session.
    
    Returns:
        Dict containing various OBS statistics including CPU usage, memory usage,
        available disk space, and session information
    """
    return await obs_client.send_request("GetStats")

@mcp.tool()
async def broadcast_custom_event(event_data: Dict[str, Any]) -> None:
    """
    Broadcasts a custom event to all WebSocket clients.
    
    Args:
        event_data: Data to send with the event
    """
    await obs_client.send_request("BroadcastCustomEvent", {"eventData": event_data})

@mcp.tool()
async def call_vendor_request(vendor_name: str, request_type: str, request_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Call a request registered to a vendor.
    
    Args:
        vendor_name: Name of the vendor to use
        request_type: The request type to call
        request_data: Additional data to pass to the request
    
    Returns:
        Response data from the vendor request
    """
    payload = {
        "vendorName": vendor_name,
        "requestType": request_type
    }
    if request_data:
        payload["requestData"] = request_data
    
    return await obs_client.send_request("CallVendorRequest", payload)

@mcp.tool()
async def get_hot_key_list() -> List[str]:
    """
    Gets an array of all available hotkey names.
    
    Returns:
        List of hotkey names
    """
    response = await obs_client.send_request("GetHotkeyList")
    return response.get("hotkeys", [])

@mcp.tool()
async def trigger_hotkey_by_name(hotkey_name: str) -> None:
    """
    Triggers a hotkey using its name.
    
    Args:
        hotkey_name: Name of the hotkey to trigger
    """
    await obs_client.send_request("TriggerHotkeyByName", {"hotkeyName": hotkey_name})

@mcp.tool()
async def trigger_hotkey_by_key_sequence(key_id: str, press_shift: bool = False, 
                                        press_ctrl: bool = False, press_alt: bool = False, 
                                        press_cmd: bool = False) -> None:
    """
    Triggers a hotkey using a sequence of keys.
    
    Args:
        key_id: The key to use (e.g., "OBS_KEY_A")
        press_shift: Whether to press the Shift key
        press_ctrl: Whether to press the Control key
        press_alt: Whether to press the Alt key
        press_cmd: Whether to press the Command key (macOS)
    """
    payload = {
        "keyId": key_id,
        "keyModifiers": {
            "shift": press_shift,
            "control": press_ctrl,
            "alt": press_alt,
            "cmd": press_cmd
        }
    }
    
    await obs_client.send_request("TriggerHotkeyByKeySequence", payload)

@mcp.tool()
async def sleep(sleep_milliseconds: int) -> None:
    """
    Sleeps for a specified amount of time (in milliseconds).
    
    Args:
        sleep_milliseconds: Number of milliseconds to sleep for
    """
    await obs_client.send_request("Sleep", {"sleepMillis": sleep_milliseconds})