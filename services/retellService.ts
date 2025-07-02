import axios from 'axios';

// Types for Retell API
export interface RetellAgent {
  agent_id: string;
  version?: number;
  is_published?: boolean;
  agent_name: string;
  voice_id: string;
  voice_model?: string;
  fallback_voice_ids?: string[];
  language: string;
  response_engine: {
    type: string;
    llm_id?: string;
    prompt?: string;
    version?: number;
  };
  voice_temperature?: number;
  voice_speed?: number;
  volume?: number;
  responsiveness?: number;
  interruption_sensitivity?: number;
  enable_backchannel?: boolean;
  backchannel_frequency?: number;
  backchannel_words?: string[];
  reminder_trigger_ms?: number;
  reminder_max_count?: number;
  ambient_sound?: string;
  ambient_sound_volume?: number;
  webhook_url?: string;
  boosted_keywords?: string[];
  enable_transcription_formatting?: boolean;
  opt_out_sensitive_data_storage?: boolean;
  opt_in_signed_url?: boolean;
  pronunciation_dictionary?: Array<{
    word: string;
    alphabet?: string;
    phoneme?: string;
  }>;
  normalize_for_speech?: boolean;
  end_call_after_silence_ms?: number;
  max_call_duration_ms?: number;
  voicemail_option?: {
    action: {
      type: string;
      text: string;
    };
  };
  post_call_analysis_data?: Array<{
    type: string;
    name: string;
    description: string;
    examples: string[];
  }>;
  post_call_analysis_model?: string;
  begin_message_delay_ms?: number;
  ring_duration_ms?: number;
  stt_mode?: string;
  vocab_specialization?: string;
  allow_user_dtmf?: boolean;
  user_dtmf_options?: {
    digit_limit: number;
    termination_key: string;
    timeout_ms: number;
  };
  denoising_mode?: string;
  last_modification_timestamp?: number;
  from_number?: string;
  dynamic_variables?: Array<{
    name: string;
    value: string;
  }>;
  privacy_enhanced?: boolean;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  record?: boolean;
  metadata?: Record<string, any>;
}

export interface RetellCall {
  call_id: string;
  agent_id: string;
  call_type: 'web_call' | 'phone_call';
  call_status: 'registered' | 'ongoing' | 'ended' | 'error';
  from_number?: string;
  to_number?: string;
  direction?: 'inbound' | 'outbound';
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  transcript?: string;
  recording_url?: string;
  public_log_url?: string;
  metadata?: Record<string, any>;
  retell_llm_dynamic_variables?: Array<{
    name: string;
    value: string;
  }>;
  opt_out_sensitive_data_storage?: boolean;
  e164_number?: string;
  disconnection_reason?: string;
  call_analysis?: {
    call_summary?: string;
    in_voicemail?: boolean;
    user_sentiment?: string;
    call_successful?: boolean;
    custom_analysis_data?: Record<string, any>;
  };
  // Cost information from Retell API (both web_call and phone_call responses)
  call_cost?: {
    product_costs?: Array<{
      product: string;
      unitPrice: number;
      cost: number;
    }>;
    total_duration_seconds?: number;
    total_duration_unit_price?: number;
    total_one_time_price?: number;
    combined_cost?: number;
  };
  // LLM token usage information from Retell API
  llm_token_usage?: {
    values?: number[];
    average?: number;
    num_requests?: number;
  };
  // Latency information from Retell API
  latency?: {
    e2e?: {
      p50?: number;
      p90?: number;
      p95?: number;
      p99?: number;
      max?: number;
      min?: number;
      num?: number;
      values?: number[];
    };
    llm?: {
      p50?: number;
      p90?: number;
      p95?: number;
      p99?: number;
      max?: number;
      min?: number;
      num?: number;
      values?: number[];
    };
    tts?: {
      p50?: number;
      p90?: number;
      p95?: number;
      p99?: number;
      max?: number;
      min?: number;
      num?: number;
      values?: number[];
    };
    [key: string]: any;
  };
}

export interface CreateWebCallRequest {
  agent_id: string;
  metadata?: Record<string, any>;
  retell_llm_dynamic_variables?: Array<{
    name: string;
    value: string;
  }>;
  opt_out_sensitive_data_storage?: boolean;
}

export interface CreateWebCallResponse {
  call_id: string;
  agent_id: string;
  call_type: 'web_call';
  call_status: 'registered';
  access_token: string;
  sample_rate: number;
  metadata?: Record<string, any>;
  retell_llm_dynamic_variables?: Array<{
    name: string;
    value: string;
  }>;
  opt_out_sensitive_data_storage?: boolean;
}

class RetellService {
  private apiKey: string;
  private baseURL: string;
  private axiosInstance;

  constructor() {
    this.apiKey = import.meta.env.VITE_RETELL_API_KEY || '';
    
    // Use local proxy for development to avoid CORS issues
    this.baseURL = '/api/retell';
    
    console.log('Retell Service Configuration:', {
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT SET',
      baseURL: this.baseURL,
      mode: 'proxy',
      envCheck: {
        VITE_RETELL_API_KEY: import.meta.env.VITE_RETELL_API_KEY ? 'SET' : 'NOT SET',
      }
    });
    
    if (!this.apiKey) {
      console.warn('Retell API key not found. Please set VITE_RETELL_API_KEY in your environment variables.');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        // Authorization is handled by the proxy
      },
    });

    // Add request interceptor for debugging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('Retell API Request:', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('Retell API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        console.error('Retell API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  // Agent Management
  async createAgent(agentData: Partial<RetellAgent>): Promise<RetellAgent> {
    try {
      console.log('Creating agent with data:', agentData);
      
      // Use the official endpoint from Retell AI documentation
      const response = await this.axiosInstance.post('/create-agent', agentData);
      console.log('Agent created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Retell agent:', error);
      console.error('Response data:', (error as any)?.response?.data);
      console.error('Status code:', (error as any)?.response?.status);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<RetellAgent> {
    try {
      const response = await this.axiosInstance.get(`/get-agent/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Retell agent:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, agentData: Partial<RetellAgent>): Promise<RetellAgent> {
    try {
      const response = await this.axiosInstance.patch(`/update-agent/${agentId}`, agentData);
      return response.data;
    } catch (error) {
      console.error('Error updating Retell agent:', error);
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/delete-agent/${agentId}`);
    } catch (error) {
      console.error('Error deleting Retell agent:', error);
      throw error;
    }
  }

  async listAgents(): Promise<RetellAgent[]> {
    try {
      const response = await this.axiosInstance.get('/list-agents');
      return response.data;
    } catch (error) {
      console.error('Error listing Retell agents:', error);
      throw error;
    }
  }

  // Call Management
  async createWebCall(request: CreateWebCallRequest): Promise<CreateWebCallResponse> {
    try {
      const response = await this.axiosInstance.post('/v2/create-web-call', request);
      return response.data;
    } catch (error) {
      console.error('Error creating web call:', error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<RetellCall> {
    try {
      const response = await this.axiosInstance.get(`/get-call/${callId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call:', error);
      throw error;
    }
  }

  async listCalls(limit?: number, offset?: number): Promise<RetellCall[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      // Try the correct endpoint without v2 prefix first
      const response = await this.axiosInstance.get(`/list-calls?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error listing calls:', error);
      throw error;
    }
  }

  // Voice Management
  async listVoices(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/list-voices');
      return response.data;
    } catch (error) {
      console.error('Error listing voices:', error);
      throw error;
    }
  }

  // Utility Methods
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Test method to verify API connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Retell API connection...');
      const response = await this.axiosInstance.get('/list-agents');
      console.log('Connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  getWebSocketURL(): string {
    return 'wss://api.retellai.com/audio-websocket';
  }

  // Phone Number Management
  async createPhoneNumber(phoneNumberData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/create-phone-number', phoneNumberData);
      return response.data;
    } catch (error) {
      console.error('Error creating phone number:', error);
      throw error;
    }
  }

  async listPhoneNumbers(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/list-phone-numbers');
      return response.data;
    } catch (error) {
      console.error('Error listing phone numbers:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const retellService = new RetellService();
export default retellService; 