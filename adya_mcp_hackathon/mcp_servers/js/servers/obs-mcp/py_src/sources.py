#!/usr/bin/env python3

from typing import Any, Dict, List, Optional
from .client import obs_client
from .server import mcp

@mcp.tool()
async def get_source_active(source_name: str) -> bool:
    """
    Gets the active status of a source.
    
    Args:
        source_name: Name of the source to get the active status of
    
    Returns:
        Whether the source is active
    """
    response = await obs_client.send_request("GetSourceActive", {"sourceName": source_name})
    return response.get("sourceActive", False)

@mcp.tool()
async def get_source_screenshot(source_name: str, image_format: str = "png", 
                               image_width: int = 0, image_height: int = 0, 
                               image_compression_quality: int = -1) -> str:
    """
    Gets a Base64-encoded screenshot of a source.
    
    Args:
        source_name: Name of the source to get a screenshot of
        image_format: Image format (png, jpeg, bmp, tga, gif)
        image_width: Screenshot width (0 = source width)
        image_height: Screenshot height (0 = source height)
        image_compression_quality: Compression quality (1-100, -1 = default)
    
    Returns:
        Base64-encoded screenshot image
    """
    payload = {
        "sourceName": source_name,
        "imageFormat": image_format
    }
    
    if image_width > 0:
        payload["imageWidth"] = image_width
    
    if image_height > 0:
        payload["imageHeight"] = image_height
    
    if image_compression_quality >= 0:
        payload["imageCompressionQuality"] = image_compression_quality
    
    response = await obs_client.send_request("GetSourceScreenshot", payload)
    return response.get("imageData", "")

@mcp.tool()
async def save_source_screenshot(source_name: str, file_path: str, image_format: str = "png", 
                                image_width: int = 0, image_height: int = 0, 
                                image_compression_quality: int = -1) -> str:
    """
    Saves a screenshot of a source to a file.
    
    Args:
        source_name: Name of the source to get a screenshot of
        file_path: Path to save the screenshot to
        image_format: Image format (png, jpeg, bmp, tga, gif)
        image_width: Screenshot width (0 = source width)
        image_height: Screenshot height (0 = source height)
        image_compression_quality: Compression quality (1-100, -1 = default)
    
    Returns:
        Path to the saved screenshot
    """
    payload = {
        "sourceName": source_name,
        "imageFormat": image_format,
        "imageFilePath": file_path
    }
    
    if image_width > 0:
        payload["imageWidth"] = image_width
    
    if image_height > 0:
        payload["imageHeight"] = image_height
    
    if image_compression_quality >= 0:
        payload["imageCompressionQuality"] = image_compression_quality
    
    response = await obs_client.send_request("SaveSourceScreenshot", payload)
    return response.get("imageData", "")

@mcp.tool()
async def get_source_filter_list(source_name: str) -> Dict[str, Any]:
    """
    Gets a list of filters on a source.
    
    Args:
        source_name: Name of the source to get the filters of
    
    Returns:
        Dict with filters array (each with name, kind, index, settings)
    """
    return await obs_client.send_request("GetSourceFilterList", {"sourceName": source_name})

@mcp.tool()
async def get_source_filter_default_settings(filter_kind: str) -> Dict[str, Any]:
    """
    Gets the default settings for a filter kind.
    
    Args:
        filter_kind: Filter type to get the default settings for
    
    Returns:
        Dict with default filter settings
    """
    return await obs_client.send_request("GetSourceFilterDefaultSettings", {"filterKind": filter_kind})

@mcp.tool()
async def create_source_filter(source_name: str, filter_name: str, filter_kind: str, 
                              filter_settings: Optional[Dict[str, Any]] = None) -> None:
    """
    Creates a new filter on a source.
    
    Args:
        source_name: Name of the source to add the filter to
        filter_name: Name for the new filter
        filter_kind: Type of filter to add
        filter_settings: Settings object to initialize the filter with
    """
    payload = {
        "sourceName": source_name,
        "filterName": filter_name,
        "filterKind": filter_kind
    }
    
    if filter_settings:
        payload["filterSettings"] = filter_settings
    
    await obs_client.send_request("CreateSourceFilter", payload)