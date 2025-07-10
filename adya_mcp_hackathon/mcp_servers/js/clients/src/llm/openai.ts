import axios, { AxiosError } from "axios";
import { LlmResponseStruct, AzureAndOpenAiChatCompletionParams,SuccessResponseDataFormat  } from "./dto.js";

// Main OpenAI Processor function
export async function OpenAIProcessor(data: any): Promise<LlmResponseStruct> {
    try {
        // Parse and validate input parameters
        const params: AzureAndOpenAiChatCompletionParams = {
            input: '',
            images_arr: [],
            input_type: 'text',
            is_stream: false,

            prompt: '',
            api_key: '',
            
            chat_model: '',
            vision_model: '',
            speech_model: '',
            speech_to_text: '',
            
            
            chat_history: [],
            tools: [],
            temperature: 0.1,

            max_tokens: 1000,
            forced_tool_calls: null,
            tool_choice: 'auto',
            ...data
        };

        var selected_model = params.chat_model;
        if (params.input_type === 'image') {
        selected_model = params.vision_model;
        }
        if (params.input_type === 'audio') {
        selected_model = params.speech_model;
        }

        
        // Validation
        if (!params.api_key) {
            return {
                Data: null,
                Error: new Error("OpenAI API Key is Required"),
                Status: false
            };
        }
        if (!params.max_tokens || params.max_tokens <= 0) {
            return {
                Data: null,
                Error: new Error("Max tokens must be greater than 0"),
                Status: false
            };
        }
        if (params.api_key == "") {
            return {
                Data: null,
                Error: new Error("OpenAI API Key is required"),
                Status: false
            };
        }

        var messages_arr = [
            {
                role: "system",
                content: params.prompt
            }
        ];

        for (var message of params.chat_history) {
            messages_arr.push({
                role: message.role,
                content: message.content
            })
        }


         // Prepare request payload
        const payload = {
            model: selected_model || "",
            messages: messages_arr,
            max_tokens: params.max_tokens || 0,
            stream: false,
            tools: params.tools || [],
            tool_choice: params.tool_choice || "auto",
            temperature: params.temperature || 0.1,
        };


        // console.log("LLM Payload ==============>>>>> ",JSON.stringify(payload), "\n\n");
        
        try {
            // Non-streaming mode
            const response = await axios({
                method: 'post',
                url: `https://api.openai.com/v1/chat/completions`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${params.api_key}`
                },
                data: payload,
                // timeout: 60000
            });

            var is_tool_call = false;
            if(response?.data?.choices?.[0]?.message?.tool_calls && response?.data?.choices?.[0]?.message?.tool_calls?.length > 0){
                is_tool_call = true;
            }
        
            var final_response_format:SuccessResponseDataFormat = {
                total_llm_calls: 1,
                total_tokens:response?.data?.usage?.total_tokens  ||  0,
                total_input_tokens: response?.data?.usage?.prompt_tokens  ||  0,
                total_output_tokens:response?.data?.usage?.completion_tokens  ||  0,
                final_llm_response:response.data || {},
                llm_responses_arr:[response.data],
                messages:[response.data?.choices?.[0]?.message?.content || "" ],
                output_type : is_tool_call ? "tool_call" : "text"
            }

            return {
                Data: final_response_format,
                Error: null,
                Status: true
            };
        }
        catch (error:any) {
            return {
                Data: null,
                Error: error?.response?.data || error?.request || error?.message,
                Status: false
            }            
        }
  
    } catch (error) {
        console.error('OpenAI Processing Error:', error);
        return {
            Data: null,
            Error: error instanceof Error ? error : new Error('An unexpected error occurred'),
            Status: false
        };
    }
}