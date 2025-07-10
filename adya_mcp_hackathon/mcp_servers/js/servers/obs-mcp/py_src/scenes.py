#!/usr/bin/env python3

from typing import Any, Dict, List, Optional

from .client import obs_client
from .server import mcp

@mcp.tool()
async def get_scene_list() -> Dict[str, Any]:
    """
    Gets an array of all scenes in OBS.
    
    Returns:
        Dict containing:
        - currentProgramSceneName: Name of the current program scene
        - currentPreviewSceneName: Name of the current preview scene (if studio mode is enabled)
        - scenes: Array of scenes (each with name, sceneIndex)
    """
    return await obs_client.send_request("GetSceneList")

@mcp.tool()
async def get_group_list() -> List[str]:
    """
    Gets an array of all groups in OBS.
    
    Returns:
        List of group names
    """
    response = await obs_client.send_request("GetGroupList")
    return response.get("groups", [])

@mcp.tool()
async def get_current_program_scene() -> str:
    """
    Gets the current program scene.
    
    Returns:
        Name of the current program scene
    """
    response = await obs_client.send_request("GetCurrentProgramScene")
    return response.get("currentProgramSceneName", "")

@mcp.tool()
async def set_current_program_scene(scene_name: str) -> None:
    """
    Sets the current program scene.
    
    Args:
        scene_name: Name of the scene to set as program
    """
    await obs_client.send_request("SetCurrentProgramScene", {"sceneName": scene_name})

@mcp.tool()
async def get_current_preview_scene() -> str:
    """
    Gets the current preview scene (only available when studio mode is enabled).
    
    Returns:
        Name of the current preview scene
    """
    response = await obs_client.send_request("GetCurrentPreviewScene")
    return response.get("currentPreviewSceneName", "")

@mcp.tool()
async def set_current_preview_scene(scene_name: str) -> None:
    """
    Sets the current preview scene (only available when studio mode is enabled).
    
    Args:
        scene_name: Name of the scene to set as preview
    """
    await obs_client.send_request("SetCurrentPreviewScene", {"sceneName": scene_name})

@mcp.tool()
async def create_scene(scene_name: str) -> None:
    """
    Creates a new scene in OBS.
    
    Args:
        scene_name: Name of the scene to create
    """
    await obs_client.send_request("CreateScene", {"sceneName": scene_name})

@mcp.tool()
async def remove_scene(scene_name: str) -> None:
    """
    Removes a scene from OBS.
    
    Args:
        scene_name: Name of the scene to remove
    """
    await obs_client.send_request("RemoveScene", {"sceneName": scene_name})

@mcp.tool()
async def set_scene_name(scene_name: str, new_scene_name: str) -> None:
    """
    Sets the name of a scene (rename).
    
    Args:
        scene_name: Current name of the scene
        new_scene_name: New name for the scene
    """
    await obs_client.send_request("SetSceneName", {
        "sceneName": scene_name,
        "newSceneName": new_scene_name
    })

@mcp.tool()
async def get_scene_scene_transition_override(scene_name: str) -> Dict[str, Any]:
    """
    Gets the scene transition override for a scene.
    
    Args:
        scene_name: Name of the scene
    
    Returns:
        Dict containing transition name and duration (if override exists)
    """
    return await obs_client.send_request("GetSceneSceneTransitionOverride", {"sceneName": scene_name})

@mcp.tool()
async def set_scene_scene_transition_override(scene_name: str, transition_name: Optional[str] = None, 
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