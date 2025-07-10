#!/usr/bin/env python3

from typing import Any, Dict, List, Optional, Union

from .client import obs_client
from .server import mcp

@mcp.tool()
async def get_scene_item_list(scene_name: str) -> List[Dict[str, Any]]:
    """
    Gets a list of all scene items in a scene.
    
    Args:
        scene_name: Name of the scene to get the items of
    
    Returns:
        List of scene items (each with sceneItemId, sourceName, sourceKind, sceneItemIndex)
    """
    response = await obs_client.send_request("GetSceneItemList", {"sceneName": scene_name})
    return response.get("sceneItems", [])

@mcp.tool()
async def get_group_item_list(scene_name: str, group_name: str) -> List[Dict[str, Any]]:
    """
    Gets a list of all scene items in a group.
    
    Args:
        scene_name: Name of the scene the group is in
        group_name: Name of the group to get the items of
    
    Returns:
        List of scene items (each with sceneItemId, sourceName, sourceKind, sceneItemIndex)
    """
    response = await obs_client.send_request("GetGroupSceneItemList", {
        "sceneName": scene_name,
        "groupName": group_name
    })
    return response.get("sceneItems", [])

@mcp.tool()
async def create_scene_item(scene_name: str, source_name: str, enabled: bool = True) -> int:
    """
    Creates a new scene item in a scene.
    
    Args:
        scene_name: Name of the scene to create the item in
        source_name: Name of the source to add to the scene
        enabled: Whether to set the scene item to enabled or disabled
    
    Returns:
        ID of the created scene item
    """
    response = await obs_client.send_request("CreateSceneItem", {
        "sceneName": scene_name,
        "sourceName": source_name,
        "sceneItemEnabled": enabled
    })
    return response.get("sceneItemId", 0)

@mcp.tool()
async def remove_scene_item(scene_name: str, scene_item_id: int) -> None:
    """
    Removes a scene item from a scene.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item to remove
    """
    await obs_client.send_request("RemoveSceneItem", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    })

@mcp.tool()
async def duplicate_scene_item(scene_name: str, scene_item_id: int, 
                              destination_scene_name: Optional[str] = None) -> int:
    """
    Duplicates a scene item in a scene.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item to duplicate
        destination_scene_name: Name of the scene to create the duplicated item in (defaults to original scene)
    
    Returns:
        ID of the duplicated scene item
    """
    payload = {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    }
    
    if destination_scene_name:
        payload["destinationSceneName"] = destination_scene_name
    
    response = await obs_client.send_request("DuplicateSceneItem", payload)
    return response.get("sceneItemId", 0)

@mcp.tool()
async def get_scene_item_id(scene_name: str, source_name: str, search_offset: int = 0) -> int:
    """
    Gets the ID of a scene item in a scene.
    
    Args:
        scene_name: Name of the scene the item is in
        source_name: Name of the source to find the ID of
        search_offset: Number of matches to skip
    
    Returns:
        ID of the scene item
    """
    response = await obs_client.send_request("GetSceneItemId", {
        "sceneName": scene_name,
        "sourceName": source_name,
        "searchOffset": search_offset
    })
    return response.get("sceneItemId", 0)

@mcp.tool()
async def get_scene_item_enabled(scene_name: str, scene_item_id: int) -> bool:
    """
    Gets the enabled state of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
    
    Returns:
        Whether the scene item is enabled
    """
    response = await obs_client.send_request("GetSceneItemEnabled", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    })
    return response.get("sceneItemEnabled", False)

@mcp.tool()
async def set_scene_item_enabled(scene_name: str, scene_item_id: int, enabled: bool) -> None:
    """
    Sets the enabled state of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
        enabled: New enabled state of the scene item
    """
    await obs_client.send_request("SetSceneItemEnabled", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id,
        "sceneItemEnabled": enabled
    })

@mcp.tool()
async def get_scene_item_locked(scene_name: str, scene_item_id: int) -> bool:
    """
    Gets the locked state of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
    
    Returns:
        Whether the scene item is locked
    """
    response = await obs_client.send_request("GetSceneItemLocked", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    })
    return response.get("sceneItemLocked", False)

@mcp.tool()
async def set_scene_item_locked(scene_name: str, scene_item_id: int, locked: bool) -> None:
    """
    Sets the locked state of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
        locked: New locked state of the scene item
    """
    await obs_client.send_request("SetSceneItemLocked", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id,
        "sceneItemLocked": locked
    })

@mcp.tool()
async def get_scene_item_index(scene_name: str, scene_item_id: int) -> int:
    """
    Gets the index position of a scene item in a scene.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
    
    Returns:
        Index position of the scene item
    """
    response = await obs_client.send_request("GetSceneItemIndex", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    })
    return response.get("sceneItemIndex", 0)

@mcp.tool()
async def set_scene_item_index(scene_name: str, scene_item_id: int, index: int) -> None:
    """
    Sets the index position of a scene item in a scene.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
        index: New index position for the scene item
    """
    await obs_client.send_request("SetSceneItemIndex", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id,
        "sceneItemIndex": index
    })

@mcp.tool()
async def get_scene_item_transform(scene_name: str, scene_item_id: int) -> Dict[str, Any]:
    """
    Gets the transform/crop info of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
    
    Returns:
        Dict with transform information (position, rotation, scale, crop, bounds)
    """
    return await obs_client.send_request("GetSceneItemTransform", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    })

@mcp.tool()
async def set_scene_item_transform(scene_name: str, scene_item_id: int, transform: Dict[str, Any]) -> None:
    """
    Sets the transform/crop info of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
        transform: Dict with transform properties to set
    """
    await obs_client.send_request("SetSceneItemTransform", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id,
        "sceneItemTransform": transform
    })

@mcp.tool()
async def get_scene_item_blend_mode(scene_name: str, scene_item_id: int) -> str:
    """
    Gets the blend mode of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
    
    Returns:
        Current blend mode of the scene item
    """
    response = await obs_client.send_request("GetSceneItemBlendMode", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id
    })
    return response.get("sceneItemBlendMode", "")

@mcp.tool()
async def set_scene_item_blend_mode(scene_name: str, scene_item_id: int, blend_mode: str) -> None:
    """
    Sets the blend mode of a scene item.
    
    Args:
        scene_name: Name of the scene the item is in
        scene_item_id: ID of the scene item
        blend_mode: New blend mode (OBS_BLEND_NORMAL, etc.)
    """
    await obs_client.send_request("SetSceneItemBlendMode", {
        "sceneName": scene_name,
        "sceneItemId": scene_item_id,
        "sceneItemBlendMode": blend_mode
    })