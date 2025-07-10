export interface LlmResponseStruct {
  Data: SuccessResponseDataFormat | null;
  Error: Error | null;
  Status: boolean;
}
export interface SuccessResponseDataFormat {
  total_llm_calls : number;
  total_tokens : number;
  total_input_tokens : number;
  total_output_tokens : number;
  final_llm_response : any;
  llm_responses_arr : Array<any>;
  messages : Array<any>;
  output_type : string;
}


export interface AzureAndOpenAiChatCompletionParams {
  input: string;
  images_arr: string[];
  input_type: string;
  is_stream: boolean;
    
  prompt: string;
  api_key: string;

  chat_model: string;
  vision_model: string;
  speech_model: string;
  speech_to_text: string;

  chat_history: Array<{ [key: string]: any }>;

  tools?: Array<{ [key: string]: any }>;
  tool_choice: string;
  forced_tool_calls?: { name: string };

  max_tokens?: number;
  temperature?: number;
}
export interface GeminiChatCompletionParams {
  input: string;
  images_arr: string[];
  input_type: string;
  is_stream: boolean;
    
  prompt: string;
  api_key: string;

  chat_model: string;
  vision_model: string;
  speech_model: string;

  chat_history: Array<{ [key: string]: any }>;

  tools?: Array<{ [key: string]: any }>;
  tool_choice: string;
  forced_tool_calls?: { name: string };

  max_tokens?: number;
  temperature?: number;
}


