# OBS MCP

***What is OBS Studio?***

**OBS Studio (Open Broadcaster Software)** is a free, open-source software used for video recording and live streaming. It supports real-time source and device capture, scene composition, encoding, broadcasting, and more.

---

### How is OBS MCP Used?

- The **OBS MCP Server** connects to the OBS WebSocket server.
- An AI assistant like Claude acts as the **client**, sending commands via the MCP protocol.
- These commands allow natural-language control of OBS scenes, sources, streaming, and transitions.

---

## MAIN FEATURES OF ***OBS MCP Server***

---

### 1. **WebSocket Connection**
**Capability**: WebSocket Authentication  
**Description**: Connects to OBS WebSocket with provided URL and password.  
**Example**: Connect to `ws://localhost:4455` using `OBS_WEBSOCKET_PASSWORD`.

---

### 2. **General Tools**
**Capabilities**: Version info, system stats, hotkey listing, studio mode toggle  
**Description**: Retrieve version data, performance metrics, and manage hotkeys or studio mode state.  
**Example**: Enable Studio Mode or get CPU usage statistics.

---

### 3. **Scene Management**
**Capabilities**: List, switch, create, and remove scenes  
**Description**: Full control over scene operations including creation and switching.  
**Example**: Switch to "Intro", create "Break" scene.

---

### 4. **Source Control**
**Capabilities**: Manage source settings, audio, and visibility  
**Description**: Control settings, volume, and mute/unmute of individual sources like cameras, mics, etc.  
**Example**: Mute microphone, update webcam resolution.

---

### 5. **Scene Item Manipulation**
**Capabilities**: Position, size, visibility of items in a scene  
**Description**: Manage scene layout elements like overlays, camera windows, and logos.  
**Example**: Resize and move a camera feed in the main scene.

---

### 6. **Streaming and Recording**
**Capabilities**: Start/Stop streaming, recording, and virtual camera  
**Description**: Programmatically control your stream or record sessions.  
**Example**: Start recording locally or stop streaming.

---

### 7. **Transition Management**
**Capabilities**: Set transition types, durations, and trigger transitions  
**Description**: Smoothly switch between scenes using configurable transitions.  
**Example**: Use fade for 2 seconds between scenes.

---

## Environment Variables

- `OBS_WEBSOCKET_URL`: WebSocket URL (default: `ws://localhost:4455`)  
- `OBS_WEBSOCKET_PASSWORD`: Password for OBS WebSocket (if set)

---

## Requirements

- **OBS Studio v31+**  
- **Node.js v16+**  
- **Claude Desktop** (or any compatible MCP AI client)



