import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

// Import specific tool modules
import * as general from "./general.js";
import * as scenes from "./scenes.js";
import * as sources from "./sources.js";
import * as sceneItems from "./scene-items.js";
import * as streaming from "./streaming.js";
import * as transitions from "./transitions.js";
import * as config from "./config.js";
import * as filters from "./filters.js";
import * as inputs from "./inputs.js";
import * as mediaInputs from "./media-inputs.js";
import * as outputs from "./outputs.js";
import * as record from "./record.js";
import * as ui from "./ui.js";

// Export the initialization function for all tools
export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // Initialize all tool modules
  await Promise.all([
    general.initialize(server, client),
    scenes.initialize(server, client),
    sources.initialize(server, client),
    sceneItems.initialize(server, client),
    streaming.initialize(server, client),
    transitions.initialize(server, client),
    config.initialize(server, client),
    filters.initialize(server, client),
    inputs.initialize(server, client),
    mediaInputs.initialize(server, client),
    outputs.initialize(server, client),
    record.initialize(server, client),
    ui.initialize(server, client)
  ]);
}

// Export tool modules
export { 
  general, 
  scenes, 
  sources, 
  sceneItems, 
  streaming, 
  transitions,
  config,
  filters,
  inputs,
  mediaInputs,
  outputs,
  record,
  ui
};