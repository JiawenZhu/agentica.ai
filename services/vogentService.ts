import axios from 'axios';

// Types for Vogent API (based on actual API response)
export interface VogentAgent {
  id: string;
  name: string;
  language: string;
  defaultExtractorId?: string | null;
  defaultVersionedPromptId?: string;
  defaultVoiceId?: string;
  maxDurationSeconds?: number;
  idleMessageConfig?: {
    enabled: boolean;
    idleDurationMilliseconds: number;
    maxIdleMessages: number;
  };
  transcriberParams?: {
    type: string;
  };
  utteranceDetectorConfig?: {
    sensitivity: string;
  };
}

export interface VogentDial {
  id: string;
  agent_id: string;
  phone_number?: string;
  status: 'active' | 'ended' | 'failed';
  duration?: number;
  created_at?: string;
  ended_at?: string;
  transcript?: string;
  recording_url?: string;
  metadata?: Record<string, any>;
}

export interface CreateVogentDialRequest {
  callAgentId: string;
  browserCall?: boolean;
  toNumber?: string;
  fromNumberId?: string;
  aiVoiceId?: string;
  voiceVolumeLevel?: number;
  versionedModelId?: string;
  timeoutMinutes?: number;
  callAgentExtractorId?: string;
  callAgentInput?: Record<string, any>;
  keywords?: string[];
  webhookUrl?: string;
}

export interface CreateVogentDialResponse {
  dialToken: string;
  sessionId: string;
  dialId: string;
}

class VogentService {
  private apiKey: string;
  private baseURL: string;
  private axiosInstance;

  constructor() {
    this.apiKey = (import.meta as any).env?.VITE_VOGENT_API_KEY || '';
    this.baseURL = (import.meta as any).env?.VITE_VOGENT_BASE_URL || 'https://api.vogent.ai/api';
    
    if (!this.apiKey) {
      console.warn('Vogent API key not found. Please set VITE_VOGENT_API_KEY in your environment variables.');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Get webhook signing secret from environment
  getWebhookSecret(): string {
    return (import.meta as any).env?.VITE_VOGENT_WEBHOOK_SECRET || '';
  }

  // Agent Management
  async listAgents(): Promise<VogentAgent[]> {
    try {
      const response = await this.axiosInstance.get('/agents');
      // Vogent API returns agents in response.data.data, not directly in response.data
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error listing Vogent agents:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<VogentAgent> {
    try {
      const response = await this.axiosInstance.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Vogent agent:', error);
      throw error;
    }
  }

  async createAgent(agentData: Partial<VogentAgent>): Promise<VogentAgent> {
    try {
      console.log('Creating Vogent agent with data:', agentData);
      const response = await this.axiosInstance.post('/agents', agentData);
      console.log('Vogent agent created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Vogent agent:', error);
      console.error('Response data:', (error as any)?.response?.data);
      console.error('Status code:', (error as any)?.response?.status);
      throw error;
    }
  }

  async updateAgent(agentId: string, agentData: Partial<VogentAgent>): Promise<VogentAgent> {
    try {
      const response = await this.axiosInstance.put(`/agents/${agentId}`, agentData);
      return response.data;
    } catch (error) {
      console.error('Error updating Vogent agent:', error);
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/agents/${agentId}`);
    } catch (error) {
      console.error('Error deleting Vogent agent:', error);
      throw error;
    }
  }

  // Dial Management
  async createDial(request: CreateVogentDialRequest): Promise<CreateVogentDialResponse> {
    try {
      const response = await this.axiosInstance.post('/dials', request);
      return response.data;
    } catch (error) {
      console.error('Error creating Vogent dial:', error);
      throw error;
    }
  }

  // Create a browser call for testing an agent
  async createBrowserCall(agentId: string, webhookUrl?: string): Promise<CreateVogentDialResponse> {
    try {
      const dialRequest: CreateVogentDialRequest = {
        callAgentId: agentId,
        browserCall: true,
        timeoutMinutes: 10,
        voiceVolumeLevel: 0, // Default volume
      };

      // Add webhook URL if provided
      if (webhookUrl) {
        dialRequest.webhookUrl = webhookUrl;
      }
      
      return await this.createDial(dialRequest);
    } catch (error) {
      console.error('Error creating Vogent browser call:', error);
      throw error;
    }
  }

  // Verify webhook signature (for backend webhook endpoints)
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.getWebhookSecret();
    if (!secret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    try {
      // This would typically use crypto.createHmac in a Node.js environment
      // For frontend, this is just a placeholder - actual verification should be done on backend
      console.log('Webhook verification should be implemented on backend server');
      return true;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  async getDial(dialId: string): Promise<VogentDial> {
    try {
      const response = await this.axiosInstance.get(`/dials/${dialId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Vogent dial:', error);
      throw error;
    }
  }

  async hangupDial(dialId: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/dials/${dialId}/hangup`);
    } catch (error) {
      console.error('Error hanging up Vogent dial:', error);
      throw error;
    }
  }

  async getDialToken(dialId: string): Promise<{ token: string }> {
    try {
      const response = await this.axiosInstance.post(`/dials/${dialId}/token`);
      return response.data;
    } catch (error) {
      console.error('Error getting Vogent dial token:', error);
      throw error;
    }
  }

  // Utility Methods
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Phone Number Management
  async listPhoneNumbers(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/phone-numbers');
      return response.data;
    } catch (error) {
      console.error('Error listing Vogent phone numbers:', error);
      throw error;
    }
  }

  async getPhoneNumber(phoneNumberId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/phone-numbers/${phoneNumberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Vogent phone number:', error);
      throw error;
    }
  }

  async updatePhoneNumber(phoneNumberId: string, data: any): Promise<any> {
    try {
      const response = await this.axiosInstance.put(`/phone-numbers/${phoneNumberId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating Vogent phone number:', error);
      throw error;
    }
  }

  async searchAvailableNumbers(params: any): Promise<any[]> {
    try {
      const response = await this.axiosInstance.post('/phone-numbers/search', params);
      return response.data;
    } catch (error) {
      console.error('Error searching available Vogent phone numbers:', error);
      throw error;
    }
  }

  async purchaseNumber(data: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/phone-numbers/purchase', data);
      return response.data;
    } catch (error) {
      console.error('Error purchasing Vogent phone number:', error);
      throw error;
    }
  }

  async deletePhoneNumber(phoneNumberId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/phone-numbers/${phoneNumberId}`);
    } catch (error) {
      console.error('Error deleting Vogent phone number:', error);
      throw error;
    }
  }

  // Models
  async listModels(): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/models');
      return response.data;
    } catch (error) {
      console.error('Error listing Vogent models:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const vogentService = new VogentService();
export default vogentService; 