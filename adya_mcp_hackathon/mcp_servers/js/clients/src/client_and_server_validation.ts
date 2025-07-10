import {MCPServers} from "./server_connection.js"
import {ClientsConfig} from "./client_and_server_config.js"

export async function ClientAndServerValidation(payload:any, streaming_callback:any) {
    try{
        var selected_server_credentials = payload?.selected_server_credentials;
        var client_details = payload?.client_details;
        var selected_client = payload?.selected_client || "";
        var selected_servers = payload?.selected_servers || [];

        if(selected_client == "" || selected_servers.length == 0 || !selected_server_credentials || !client_details){
            console.log("Invalid Request Payload");
            return {
                "payload": null,
                "error": "Invalid Request Payload",
                "status": false
            }
        }
        for (var server of selected_servers) {
            if(!MCPServers[server]){
                console.log("Invalid Server");
                return {
                    "payload": null,
                    "error": "Invalid Server",
                    "status": false
                }
            }
        }
        if(!ClientsConfig.includes(selected_client)){
            console.log("Invalid Client");
            return {
                "payload": null,
                "error": "Invalid Client",
                "status": false
            }
        }

        var tools_arr=[];
        for (var server of selected_servers) {
            if(MCPServers[server]){
                var resource:any = await MCPServers[server].listTools();       
                for (var tool of resource.tools) {
                    tools_arr.push({
                        type: "function",
                        function: {
                          name: tool.name,
                          description: tool.description || `Tool for ${tool.name}`,
                          parameters: tool.inputSchema || {
                            type: "object",
                            properties: {},
                            required: []
                          }
                        }
                      });    
                }
            }
        }
        client_details["tools"] = tools_arr;


        
        return {
            "payload": {
                "selected_client": selected_client,
                "selected_servers": selected_servers,
                "selected_server_credentials": selected_server_credentials,
                "client_details": client_details
            },
            "error": null,
            "status": true
        }
    } catch (err) {
        console.log("Error initializing MCP ==========>>>> " , err);
        return {
            "payload": null,
            "error": err,
            "status": false
        }
    }
}