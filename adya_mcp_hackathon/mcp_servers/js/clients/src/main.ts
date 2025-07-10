import express from 'express';
import cors from "cors";
import logger from "morgan";
import { initializeAlllMCP } from './server_connection.js';
import { ClientAndServerValidation } from './client_and_server_validation.js';
import {ClientAndServerExecution} from "./client_and_server_execution.js"



// Initialize Express app
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

function customLogger(tokens:any, req:any, res:any) {
  const date = new Date().toISOString(); // Current timestamp
  const method = tokens.method(req, res); // HTTP method
  const url = tokens.url(req, res); // URL requested
  const httpVersion = "HTTP/" + req.httpVersion; // HTTP version
  const statusCode = res.statusCode; // HTTP status code

  // Construct custom log message
  return `date: ${date}, ${method} ${url} ${httpVersion} ${statusCode}`;
}
app.use(logger(customLogger));



app.get('/', (req, res) => {
  res.send({ message: 'Javascript McpClient Working fine....' });
});

// Non-streaming API endpoint
app.post('/api/v1/mcp/process_message', async (req: any, res: any) => {
  try {
    console.log("⏳ Steps : Process Started ✅...");
    const data:any = { ...req.body };
    data.client_details["is_stream"] = false;
    
    // =========================================== validation check start =============================================================
    
    const validation_result = await ClientAndServerValidation(data, {streamCallbacks : null, is_stream: false});
    if (!validation_result.status) {
      console.log("⏳ Steps :  Client & Server Validation Failed ❌...");
      console.log("⏳ Steps : Process Failed ❌...");
      return res.status(200).json({
        Data: null,
        Error: validation_result.error,
        Status: false,
      });
    }
    console.log("⏳ Steps : Client & Server Validated successfully✅...");
    // =========================================== validation check end =============================================================

    // =========================================== execution start ====================================================================
    var generated_payload = validation_result.payload;
    var executionResponse = await ClientAndServerExecution(generated_payload, {streamCallbacks : null, is_stream: false});
    // =========================================== execution start ====================================================================
    console.log("⏳ Steps : Client & Server Executed successful✅...");
    console.log("RESPONSE:",executionResponse)
    console.log("⏳ Steps : Process Completed ✅...");
    res.status(200).json(executionResponse);

  } catch (error) {
    console.log("Error ========>>>>> ", error);
    console.log("⏳ Steps : Process Failed ❌...");
    res.status(500).json({
      Data: null,
      Error: error instanceof Error ? error.message : 'An unexpected error occurred',
      Status: false,
    });
  }
});

app.post('/api/v1/mcp/process_message_stream', async (req: any, res: any) => {
  // Custom handler for streaming responses
  const customStreamHandler = {
    onData: (chunk: string) => {
      res.write(`data: ${chunk}\n\n`);
    },
    onEnd: () => {
      res.write(`data: ${JSON.stringify( {
        Data: null,
        Error: null,
        Status: true,
        StreamingStatus : "COMPLETED",
        Action:"NO-ACTION"
      })}\n\n`);
      res.end();
    },
    onError: (error: Error) => {
      console.log("Streaming Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  };
  try {
    const data:any = { ...req.body };
    data.client_details["is_stream"] = false;

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');


    

    customStreamHandler.onData(JSON.stringify( {
      Data: null,
      Error: null,
      Status: true,
      StreamingStatus : "STARTED",
      Action:"NO-ACTION"
    }));

    // =========================================== validation check start =============================================================
    const validation_result = await ClientAndServerValidation(data, {streamCallbacks : customStreamHandler, is_stream: true});
    if (!validation_result.status) {
        customStreamHandler.onData(JSON.stringify( {
          Data: null,
          Error: validation_result.error,
          Status: false,
          StreamingStatus : "ERROR",
          Action:"ERROR"
        }));
        customStreamHandler.onEnd();
        return;
    }
    // =========================================== validation check end =============================================================

    // =========================================== execution start ====================================================================
    var generated_payload = validation_result.payload;
    var executionResponse = await ClientAndServerExecution(generated_payload, {streamCallbacks : customStreamHandler, is_stream: true});
    // =========================================== execution start ====================================================================
    if(!executionResponse.Status){
      customStreamHandler.onData(JSON.stringify( {
        Data: executionResponse.Data,
        Error: executionResponse.Error,
        Status: false,
        StreamingStatus : "ERROR",
        Action:"ERROR"
      }));
      customStreamHandler.onEnd();
      return;
    }
    customStreamHandler.onData(JSON.stringify( {
      Data: executionResponse.Data,
      Error: executionResponse.Error,
      Status: executionResponse.Status,
      StreamingStatus : "IN-PROGRESS",
      Action:"AI-RESPONSE"
    }));
    customStreamHandler.onEnd();

  } catch (error) {
    console.log("Error ========>>>>> ", error);
    customStreamHandler.onData(JSON.stringify( {
      Data:null,
      Error: error,
      Status: false,
      StreamingStatus : "ERROR",
      Action:"ERROR"
    }));
    customStreamHandler.onEnd();
    return;
  }
});


console.log("Current working directory:", process.cwd());
// Start the server
const PORT = 5000;
app.listen(PORT, async () => {
  await initializeAlllMCP();
  console.log("╔═══════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                                                                                           ║");
  console.log("║                                📈🚀✨ ADYA  📈🚀✨                                        ║");
  console.log("║                                                                                           ║");
  console.log("║  🎉 Welcome to the MCP(Model Context Protocol) Server Integration Hackathon 2k25 !! 🎉    ║");
  console.log("║                                                                                           ║");
  console.log("║  ✅ Server running on http://localhost:5000 ✅                                            ║");
  console.log("║                                                                                           ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════════════════════╝");
});