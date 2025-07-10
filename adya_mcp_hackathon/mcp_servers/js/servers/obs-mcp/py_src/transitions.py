#!/usr/bin/env python3

from typing import Any, Dict, List, Optional

from .client import obs_client
from .server import mcp

@mcp.tool()
async def get_transition_kind_list() -> List[str]:
    """
    Gets an array of all available transition kinds.
    
    Returns:
        List of transition kinds
    """
    response = await obs_client.send_request("GetTransitionKindList")
    return response.get("transitionKinds", [])

@mcp.tool()
async def get_scene_transition_list() -> Dict[str, Any]:
    """
    Gets an array of all scene transitions in OBS.
    
    Returns:
        Dict containing:
        - currentSceneTransitionKind: Kind of the current scene transition
        - currentSceneTransitionName: Name of the current scene transition
        - currentSceneTransitionDuration: Duration of the current scene transition (in milliseconds)
        - transitions: Array of transitions (each with name, kind)
    """
    return await obs_client.send_request("GetSceneTransitionList")

@mcp.tool()
async def get_current_scene_transition() -> Dict[str, Any]:
    """
    Gets information about the current scene transition.
    
    Returns:
        Dict containing transition information including kind, name, duration, and settings
    """
    return await obs_client.send_request("GetCurrentSceneTransition")

@mcp.tool()
async def set_current_scene_transition(transition_name: str) -> None:
    """
    Sets the current scene transition.
    
    Args:
        transition_name: Name of the transition to set as current
    """
    await obs_client.send_request("SetCurrentSceneTransition", {"transitionName": transition_name})

@mcp.tool()
async def set_current_scene_transition_duration(transition_duration: int) -> None:
    """
    Sets the duration of the current scene transition (if supported).
    
    Args:
        transition_duration: Duration in milliseconds
    """
    await obs_client.send_request("SetCurrentSceneTransitionDuration", 
                                 {"transitionDuration": transition_duration})

@mcp.tool()
async def set_current_scene_transition_settings(transition_settings: Dict[str, Any], overlay: bool = True) -> None:
    """
    Sets the settings of the current scene transition.
    
    Args:
        transition_settings: Settings object to apply to the transition
        overlay: Whether to overlay with existing settings or replace them
    """
    await obs_client.send_request("SetCurrentSceneTransitionSettings", {
        "transitionSettings": transition_settings,
        "overlay": overlay
    })

@mcp.tool()
async def get_scene_transition_override(scene_name: str) -> Dict[str, Any]:
    """
    Gets the scene transition override for a scene.
    
    Args:
        scene_name: Name of the scene
    
    Returns:
        Dict containing transition name and duration (if override exists)
    """
    return await obs_client.send_request("GetSceneSceneTransitionOverride", {"sceneName": scene_name})

@mcp.tool()
async def set_scene_transition_override(scene_name: str, transition_name: Optional[str] = None, 
                                       transition_duration: Optional[int] = None) -> None:
    """
    Sets the scene transition override for a scene.
    
    Args:
        scene_name: Name of the scene
        transition_name: Name of the transition to use, or null to remove
        transition_duration: Duration in milliseconds of the transition, or null to use default
    """
    payload = {"sceneName": scene_name}
    
    if transition_name is not None:
        payload["transitionName"] = transition_name
    
    if transition_duration is not None:
        payload["transitionDuration"] = transition_duration
    
    await obs_client.send_request("SetSceneSceneTransitionOverride", payload)

@mcp.tool()
async def trigger_studio_mode_transition() -> None:
    """
    Triggers the current scene transition. Only available when studio mode is enabled.
    """
    await obs_client.send_request("TriggerStudioModeTransition")

@mcp.tool()
async def set_tbar_position(tbar_position: float) -> None:
    """
    Sets the position of the transition bar.
    
    Args:
        tbar_position: Position to set the T-bar to (0.0-1.0)
    """
    await obs_client.send_request("SetTBarPosition", {"position": tbar_position})