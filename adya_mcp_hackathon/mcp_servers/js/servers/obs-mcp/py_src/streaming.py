#!/usr/bin/env python3

from typing import Any, Dict, Optional

from .client import obs_client
from .server import mcp

@mcp.tool()
async def get_stream_status() -> Dict[str, Any]:
    """
    Gets the status of the stream output.
    
    Returns:
        Dict containing stream status information including:
        - outputActive: Whether the output is active
        - outputReconnecting: Whether the output is reconnecting
        - outputTimecode: Timecode string of the output
        - outputDuration: Duration in milliseconds of the output
        - outputBytes: Total bytes sent by the output
        - outputSkippedFrames: Number of frames skipped by the output
        - outputTotalFrames: Total frames processed by the output
    """
    return await obs_client.send_request("GetStreamStatus")

@mcp.tool()
async def toggle_stream() -> bool:
    """
    Toggles the status of the stream output.
    
    Returns:
        Whether the output is active after toggling
    """
    response = await obs_client.send_request("ToggleStream")
    return response.get("outputActive", False)

@mcp.tool()
async def start_stream() -> None:
    """
    Starts the stream output.
    """
    await obs_client.send_request("StartStream")

@mcp.tool()
async def stop_stream() -> None:
    """
    Stops the stream output.
    """
    await obs_client.send_request("StopStream")

@mcp.tool()
async def send_stream_caption(caption_text: str) -> None:
    """
    Sends CEA-608 caption text over the stream output.
    
    Args:
        caption_text: Caption text to send
    """
    await obs_client.send_request("SendStreamCaption", {"captionText": caption_text})

@mcp.tool()
async def get_record_status() -> Dict[str, Any]:
    """
    Gets the status of the record output.
    
    Returns:
        Dict containing record status information including:
        - outputActive: Whether the output is active
        - outputPaused: Whether the output is paused
        - outputTimecode: Timecode string of the output
        - outputDuration: Duration in milliseconds of the output
        - outputBytes: Total bytes recorded
        - outputPath: File path of the recording
    """
    return await obs_client.send_request("GetRecordStatus")

@mcp.tool()
async def toggle_record() -> bool:
    """
    Toggles the status of the record output.
    
    Returns:
        Whether the output is active after toggling
    """
    response = await obs_client.send_request("ToggleRecord")
    return response.get("outputActive", False)

@mcp.tool()
async def start_record() -> None:
    """
    Starts the record output.
    """
    await obs_client.send_request("StartRecord")

@mcp.tool()
async def stop_record() -> Dict[str, str]:
    """
    Stops the record output.
    
    Returns:
        Dict containing the output path of the stopped recording
    """
    return await obs_client.send_request("StopRecord")

@mcp.tool()
async def toggle_record_pause() -> bool:
    """
    Toggles pause on the record output.
    
    Returns:
        Whether the output is paused after toggling
    """
    response = await obs_client.send_request("ToggleRecordPause")
    return response.get("outputPaused", False)

@mcp.tool()
async def pause_record() -> None:
    """
    Pauses the record output.
    """
    await obs_client.send_request("PauseRecord")

@mcp.tool()
async def resume_record() -> None:
    """
    Resumes the record output.
    """
    await obs_client.send_request("ResumeRecord")

@mcp.tool()
async def get_virtual_cam_status() -> Dict[str, Any]:
    """
    Gets the status of the virtual camera output.
    
    Returns:
        Dict containing:
        - outputActive: Whether the output is active
    """
    return await obs_client.send_request("GetVirtualCamStatus")

@mcp.tool()
async def toggle_virtual_cam() -> bool:
    """
    Toggles the state of the virtual camera output.
    
    Returns:
        Whether the output is active after toggling
    """
    response = await obs_client.send_request("ToggleVirtualCam")
    return response.get("outputActive", False)

@mcp.tool()
async def start_virtual_cam() -> None:
    """
    Starts the virtual camera output.
    """
    await obs_client.send_request("StartVirtualCam")

@mcp.tool()
async def stop_virtual_cam() -> None:
    """
    Stops the virtual camera output.
    """
    await obs_client.send_request("StopVirtualCam")

@mcp.tool()
async def get_replay_buffer_status() -> Dict[str, Any]:
    """
    Gets the status of the replay buffer output.
    
    Returns:
        Dict containing:
        - outputActive: Whether the output is active
    """
    return await obs_client.send_request("GetReplayBufferStatus")

@mcp.tool()
async def toggle_replay_buffer() -> bool:
    """
    Toggles the state of the replay buffer output.
    
    Returns:
        Whether the output is active after toggling
    """
    response = await obs_client.send_request("ToggleReplayBuffer")
    return response.get("outputActive", False)

@mcp.tool()
async def start_replay_buffer() -> None:
    """
    Starts the replay buffer output.
    """
    await obs_client.send_request("StartReplayBuffer")

@mcp.tool()
async def stop_replay_buffer() -> None:
    """
    Stops the replay buffer output.
    """
    await obs_client.send_request("StopReplayBuffer")

@mcp.tool()
async def save_replay_buffer() -> None:
    """
    Saves the contents of the replay buffer output.
    """
    await obs_client.send_request("SaveReplayBuffer")

@mcp.tool()
async def get_last_replay_buffer_replay() -> Dict[str, str]:
    """
    Gets the filename of the last replay buffer save file.
    
    Returns:
        Dict containing:
        - savedReplayPath: Path of the saved replay file
    """
    return await obs_client.send_request("GetLastReplayBufferReplay")