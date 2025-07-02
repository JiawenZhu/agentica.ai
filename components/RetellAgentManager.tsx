import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Play, Settings, Bot, Phone, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { retellService, RetellAgent } from '../services/retellService';
import { RetellVoiceCall } from './RetellVoiceCall';
import { RetellUsageModal } from './RetellUsageModal';

interface RetellAgentManagerProps {
  className?: string;
}

interface AgentFormData {
  agent_name: string;
  voice_id: string;
  voice_model: string;
  language: string;
  prompt: string;
  voice_temperature: number;
  voice_speed: number;
  volume: number;
  responsiveness: number;
  webhook_url: string;
  post_call_analysis_model: string;
  post_call_analysis_data: Array<{
    type: string;
    name: string;
    description: string;
    examples: string[];
  }>;
}

const DEFAULT_AGENT_DATA: AgentFormData = {
  agent_name: '',
  voice_id: '11labs-Adrian',
  voice_model: 'eleven_turbo_v2',
  language: 'en-US',
  prompt: 'You are a helpful AI assistant. Be friendly, professional, and concise in your responses.',
  voice_temperature: 1.0,
  voice_speed: 1.0,
  volume: 1.0,
  responsiveness: 1.0,
  webhook_url: '',
  post_call_analysis_model: 'gpt-4o-mini',
  post_call_analysis_data: [],
};

const VOICE_OPTIONS = [
  // ElevenLabs Female Voices
  { id: '11labs-Jenny', name: 'Jenny (Female, American)' },
  { id: '11labs-Lily', name: 'Lily (Female, American)' },
  { id: '11labs-Marissa', name: 'Marissa (Female, American)' },
  { id: '11labs-Kate', name: 'Kate (Female, American)' },
  { id: '11labs-Anna', name: 'Anna (Female, American)' },
  { id: '11labs-Grace', name: 'Grace (Female, American)' },
  { id: '11labs-Amy', name: 'Amy (Female, British)' },
  { id: '11labs-Dorothy', name: 'Dorothy (Female, British)' },
  
  // ElevenLabs Male Voices  
  { id: '11labs-Adrian', name: 'Adrian (Male, American)' },
  { id: '11labs-Billy', name: 'Billy (Male, American)' },
  { id: '11labs-Brian', name: 'Brian (Male, American)' },
  { id: '11labs-Ethan', name: 'Ethan (Male, American)' },
  { id: '11labs-Jason', name: 'Jason (Male, American)' },
  { id: '11labs-Lucas', name: 'Lucas (Male, American)' },
  { id: '11labs-Anthony', name: 'Anthony (Male, British)' },
  { id: '11labs-Joe', name: 'Joe (Male, American)' },
  
  // OpenAI Voices
  { id: 'openai-Alloy', name: 'Alloy (OpenAI, Male)' },
  { id: 'openai-Echo', name: 'Echo (OpenAI, Male)' },
  { id: 'openai-Fable', name: 'Fable (OpenAI, Male)' },
  { id: 'openai-Onyx', name: 'Onyx (OpenAI, Male)' },
  { id: 'openai-Nova', name: 'Nova (OpenAI, Female)' },
  { id: 'openai-Shimmer', name: 'Shimmer (OpenAI, Female)' },
  { id: 'openai-Sage', name: 'Sage (OpenAI, Female)' },
  { id: 'openai-Coral', name: 'Coral (OpenAI, Female)' },
];

const VOICE_MODEL_OPTIONS = [
  { id: 'eleven_turbo_v2', name: 'Eleven Turbo V2', price: '$0.07/min voice', provider: 'ElevenLabs' },
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual V2', price: '$0.07/min voice', provider: 'ElevenLabs' },
  { id: 'eleven_flash_v2', name: 'Eleven Flash V2', price: '$0.07/min voice', provider: 'ElevenLabs' },
  { id: 'tts-1', name: 'TTS-1', price: '$0.08/min voice', provider: 'OpenAI' },
  { id: 'tts-1-hd', name: 'TTS-1 HD', price: '$0.08/min voice', provider: 'OpenAI' },
];

const POST_CALL_ANALYSIS_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', price: '$0.006/min' },
  { id: 'gpt-4o', name: 'GPT-4o', price: '$0.05/min' },
  { id: 'gpt-4.1', name: 'GPT-4.1', price: '$0.045/min' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', price: '$0.016/min' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', price: '$0.004/min' },
  { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', price: '$0.06/min' },
  { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', price: '$0.02/min' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', price: '$0.006/min' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', price: '$0.003/min' },
];

export function RetellAgentManager({ className = '' }: RetellAgentManagerProps) {
  const [agents, setAgents] = useState<RetellAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<RetellAgent | null>(null);
  const [testingAgent, setTestingAgent] = useState<RetellAgent | null>(null);
  const [usageAgent, setUsageAgent] = useState<RetellAgent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>(DEFAULT_AGENT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load agents on component mount
  useEffect(() => {
    // Test API connection first
    const testConnection = async () => {
      console.log('Testing Retell API connection...');
      const connectionWorking = await retellService.testConnection();
      console.log('Connection test result:', connectionWorking);
      
      if (connectionWorking) {
        loadAgents();
      } else {
        setError('Unable to connect to Retell API. Please check your configuration.');
      }
    };
    
    testConnection();
  }, []);

  // Memoized form data updater to prevent re-renders
  const updateFormData = useCallback((field: keyof AgentFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-update voice_model when voice_id changes to match provider
      if (field === 'voice_id') {
        if (value.startsWith('11labs-')) {
          // ElevenLabs voices need ElevenLabs models
          // For non-English languages, use multilingual model
          if (newData.language && !newData.language.startsWith('en-')) {
            newData.voice_model = 'eleven_multilingual_v2';
          } else {
            newData.voice_model = 'eleven_flash_v2';
          }
        } else if (value.startsWith('openai-')) {
          // OpenAI voices need OpenAI models  
          newData.voice_model = 'tts-1';
        } else if (value.startsWith('cartesia-')) {
          // Cartesia voices (if any)
          newData.voice_model = 'eleven_flash_v2'; // Default fallback
        } else if (value.startsWith('playht-')) {
          // PlayHT voices (if any)
          newData.voice_model = 'eleven_flash_v2'; // Default fallback
        }
      }
      
      // Auto-update voice_model when language changes to match language requirements
      if (field === 'language') {
        if (value && !value.startsWith('en-')) {
          // Non-English languages require multilingual model for ElevenLabs voices
          if (newData.voice_id && newData.voice_id.startsWith('11labs-')) {
            newData.voice_model = 'eleven_multilingual_v2';
          }
        } else {
          // English languages can use standard models
          if (newData.voice_id) {
            if (newData.voice_id.startsWith('11labs-')) {
              newData.voice_model = 'eleven_flash_v2';
            } else if (newData.voice_id.startsWith('openai-')) {
              newData.voice_model = 'tts-1';
            }
          }
        }
      }
      
      return newData;
    });
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const agentList = await retellService.listAgents();
      
      // Deduplicate agents by agent_id to fix React key warning
      const uniqueAgents = agentList.reduce((acc: RetellAgent[], current: RetellAgent) => {
        const existingAgent = acc.find(agent => agent.agent_id === current.agent_id);
        if (!existingAgent) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      console.log(`Loaded ${agentList.length} agents, deduplicated to ${uniqueAgents.length} unique agents`);
      setAgents(uniqueAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      setError('Failed to load agents. Please check your API key and try again.');
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateAgent = async () => {
    if (!formData.agent_name.trim()) {
      console.log('Create validation failed: Agent name is required');
      toast.error('Please provide an agent name');
      return;
    }

    // Validate required fields
    if (!formData.voice_id) {
      console.log('Create validation failed: Voice is required');
      toast.error('Please select a voice');
      return;
    }

    if (!formData.language) {
      console.log('Create validation failed: Language is required');
      toast.error('Please select a language');
      return;
    }

    console.log('Starting agent creation with form data:', formData);
    setIsSubmitting(true);
    try {
      // Start with minimal required fields based on Retell AI documentation
      const agentData: Partial<RetellAgent> = {
        response_engine: {
          type: 'retell-llm',
          llm_id: 'llm_709e84d6385b65017bb93881d20b',
        },
        voice_id: formData.voice_id,
      };

      // Add optional fields if they have values
      if (formData.agent_name.trim()) {
        agentData.agent_name = formData.agent_name;
      }
      if (formData.language) {
        agentData.language = formData.language;
      }
      if (formData.voice_model) {
        agentData.voice_model = formData.voice_model;
      }
      if (formData.prompt.trim()) {
        agentData.response_engine!.prompt = formData.prompt;
      }
      if (formData.voice_temperature !== 1.0) {
        agentData.voice_temperature = formData.voice_temperature;
      }
      if (formData.voice_speed !== 1.0) {
        agentData.voice_speed = formData.voice_speed;
      }
      if (formData.volume !== 1.0) {
        agentData.volume = formData.volume;
      }
      if (formData.responsiveness !== 1.0) {
        agentData.responsiveness = formData.responsiveness;
      }
      if (formData.webhook_url.trim()) {
        agentData.webhook_url = formData.webhook_url;
      }
      if (formData.post_call_analysis_model) {
        agentData.post_call_analysis_model = formData.post_call_analysis_model;
      }
      if (formData.post_call_analysis_data.length > 0) {
        agentData.post_call_analysis_data = formData.post_call_analysis_data;
      }

      console.log('Creating agent with data:', agentData);
      console.log('Retell service configured:', retellService.isConfigured());
      
      const newAgent = await retellService.createAgent(agentData);
      console.log('Agent created successfully:', newAgent);
      
      setAgents(prev => [...prev, newAgent]);
      toast.success(`Agent "${newAgent.agent_name}" created successfully!`);
      resetForm();
    } catch (error) {
      console.error('Error creating agent:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        data: (error as any)?.response?.data
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create agent: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !formData.agent_name.trim()) {
      console.log('Update validation failed:', { editingAgent: !!editingAgent, agentName: formData.agent_name.trim() });
      toast.error('Please provide a valid agent name');
      return;
    }

    console.log('Starting agent update for:', editingAgent.agent_id);
    setIsSubmitting(true);
    try {
      // Build a minimal update payload with only the fields that actually changed
      const agentData: Partial<RetellAgent> = {};

      // Always include agent name
      agentData.agent_name = formData.agent_name;

      // Only include voice settings if they changed
      if (formData.voice_id !== editingAgent.voice_id) {
        agentData.voice_id = formData.voice_id;
      }
      
      if (formData.voice_model !== (editingAgent.voice_model || 'eleven_turbo_v2')) {
        agentData.voice_model = formData.voice_model;
      }

      if (formData.language !== editingAgent.language) {
        agentData.language = formData.language;
      }

      // Include response engine if prompt changed
      if (formData.prompt !== (editingAgent.response_engine?.prompt || '')) {
        agentData.response_engine = {
          type: 'retell-llm',
          llm_id: editingAgent.response_engine?.llm_id || 'llm_709e84d6385b65017bb93881d20b',
          prompt: formData.prompt,
        };
      }

      // Include voice settings if they changed
      if (formData.voice_temperature !== (editingAgent.voice_temperature || 1.0)) {
        agentData.voice_temperature = formData.voice_temperature;
      }
      
      if (formData.voice_speed !== (editingAgent.voice_speed || 1.0)) {
        agentData.voice_speed = formData.voice_speed;
      }
      
      if (formData.volume !== (editingAgent.volume || 1.0)) {
        agentData.volume = formData.volume;
      }
      
      if (formData.responsiveness !== (editingAgent.responsiveness || 1.0)) {
        agentData.responsiveness = formData.responsiveness;
      }

      // Include webhook if changed
      if (formData.webhook_url !== (editingAgent.webhook_url || '')) {
        agentData.webhook_url = formData.webhook_url || undefined;
      }

      // Include analysis settings if changed
      if (formData.post_call_analysis_model !== (editingAgent.post_call_analysis_model || 'gpt-4o-mini')) {
        agentData.post_call_analysis_model = formData.post_call_analysis_model;
      }

      // Include analysis data if changed
      const currentAnalysisData = editingAgent.post_call_analysis_data || [];
      const newAnalysisData = formData.post_call_analysis_data.filter(field => field.name.trim());
      if (JSON.stringify(currentAnalysisData) !== JSON.stringify(newAnalysisData)) {
        agentData.post_call_analysis_data = newAnalysisData.length > 0 ? newAnalysisData : undefined;
      }

      console.log('Updating agent with minimal data:', agentData);
      const updatedAgent = await retellService.updateAgent(editingAgent.agent_id, agentData);
      console.log('Agent updated successfully:', updatedAgent);
      
      setAgents(prev => prev.map(agent => 
        agent.agent_id === editingAgent.agent_id ? updatedAgent : agent
      ));
      toast.success(`Agent "${updatedAgent.agent_name}" updated successfully!`);
      resetForm();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error(`Failed to update agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agent: RetellAgent) => {
    if (!confirm(`Are you sure you want to delete "${agent.agent_name}"?`)) {
      return;
    }

    try {
      await retellService.deleteAgent(agent.agent_id);
      setAgents(prev => prev.filter(a => a.agent_id !== agent.agent_id));
      toast.success(`Agent "${agent.agent_name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const openEditDialog = (agent: RetellAgent) => {
    setEditingAgent(agent);
    setFormData({
      agent_name: agent.agent_name,
      voice_id: agent.voice_id,
      voice_model: agent.voice_model || 'eleven_turbo_v2',
      language: agent.language,
      prompt: agent.response_engine.prompt || '',
      voice_temperature: agent.voice_temperature || 1.0,
      voice_speed: agent.voice_speed || 1.0,
      volume: agent.volume || 1.0,
      responsiveness: agent.responsiveness || 1.0,
      webhook_url: agent.webhook_url || '',
      post_call_analysis_model: agent.post_call_analysis_model || 'gpt-4o-mini',
      post_call_analysis_data: agent.post_call_analysis_data || [],
    });
    setIsCreateDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(DEFAULT_AGENT_DATA);
    setEditingAgent(null);
    setIsCreateDialogOpen(false);
  };

  const openCreateDialog = () => {
    setEditingAgent(null);
    setFormData(DEFAULT_AGENT_DATA);
    setIsCreateDialogOpen(true);
  };

  const renderAgentForm = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center pb-4 border-b border-gray-300 dark:border-gray-600">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {editingAgent ? 'Edit Agent' : 'Create New Agent'}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
          {editingAgent ? 'Update your AI agent configuration' : 'Configure your AI voice agent with custom settings'}
        </p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <h4 className="font-bold text-gray-900 dark:text-white">Basic Information</h4>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg border border-gray-300 dark:border-gray-600 space-y-4">
          <div>
            <Label htmlFor="agent_name" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Agent Name *
            </Label>
            <Input
              id="agent_name"
              key="retell-agent-name-input"
              value={formData.agent_name}
              onChange={(e) => updateFormData('agent_name', e.target.value)}
              placeholder="e.g., Customer Support Assistant"
              className="w-full bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium focus:border-blue-600 dark:focus:border-blue-400"
            />
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">Choose a descriptive name for your agent</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voice_id" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                Voice *
              </Label>
              <Select
                value={formData.voice_id}
                onValueChange={(value) => updateFormData('voice_id', value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500">
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id} className="text-gray-900 dark:text-white font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        {voice.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                Language *
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => updateFormData('language', value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500">
                  <SelectItem value="en-US" className="text-gray-900 dark:text-white font-medium">🇺🇸 English (US)</SelectItem>
                  <SelectItem value="en-GB" className="text-gray-900 dark:text-white font-medium">🇬🇧 English (UK)</SelectItem>
                  <SelectItem value="es-ES" className="text-gray-900 dark:text-white font-medium">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="fr-FR" className="text-gray-900 dark:text-white font-medium">🇫🇷 French</SelectItem>
                  <SelectItem value="de-DE" className="text-gray-900 dark:text-white font-medium">🇩🇪 German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Voice Model Section */}
          <div>
            <Label htmlFor="voice_model" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Voice Model
            </Label>
            <Select
              value={formData.voice_model}
              onValueChange={(value) => updateFormData('voice_model', value)}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium">
                <SelectValue placeholder="Select voice model" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500">
                {VOICE_MODEL_OPTIONS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-gray-900 dark:text-white font-medium">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{model.name}</span>
                        <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400">{model.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">
              Voice engine cost only. Total cost = Voice + LLM + Telephony ($0.015/min)
            </p>
          </div>

          {/* Webhook URL */}
          <div>
            <Label htmlFor="webhook_url" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Webhook URL
            </Label>
            <Input
              id="webhook_url"
              value={formData.webhook_url}
              onChange={(e) => updateFormData('webhook_url', e.target.value)}
              placeholder="https://your-webhook-url.com/webhook"
              className="w-full bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium focus:border-blue-600 dark:focus:border-blue-400"
            />
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">Optional webhook URL for call events</p>
          </div>
        </div>
      </div>

      {/* System Prompt */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <h4 className="font-bold text-gray-900 dark:text-white">System Prompt</h4>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg border border-gray-300 dark:border-gray-600">
          <Label htmlFor="prompt" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
            Agent Instructions
          </Label>
          <Textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => updateFormData('prompt', e.target.value)}
            placeholder="You are a helpful AI assistant. Be friendly, professional, and concise in your responses."
            rows={4}
            className="w-full resize-none bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium focus:border-blue-600 dark:focus:border-blue-400"
          />
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 font-medium">
            Define how your agent should behave and respond to users
          </p>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <h4 className="font-bold text-gray-900 dark:text-white">Voice Settings</h4>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg border border-gray-300 dark:border-gray-600 space-y-6">
          {/* Voice Temperature */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Voice Temperature
              </Label>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {formData.voice_temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[formData.voice_temperature]}
              onValueChange={(value) => updateFormData('voice_temperature', value[0])}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              <span>Monotone (0)</span>
              <span>Expressive (2)</span>
            </div>
          </div>

          {/* Voice Speed */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Voice Speed
              </Label>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {formData.voice_speed.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[formData.voice_speed]}
              onValueChange={(value) => updateFormData('voice_speed', value[0])}
              max={2}
              min={0.5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              <span>Slow (0.5)</span>
              <span>Fast (2.0)</span>
            </div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Volume
              </Label>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {formData.volume.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[formData.volume]}
              onValueChange={(value) => updateFormData('volume', value[0])}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              <span>Quiet (0)</span>
              <span>Loud (2.0)</span>
            </div>
          </div>

          {/* Responsiveness */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                Responsiveness
              </Label>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {formData.responsiveness.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[formData.responsiveness]}
              onValueChange={(value) => updateFormData('responsiveness', value[0])}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              <span>Patient (0)</span>
              <span>Quick (2.0)</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg border border-blue-300 dark:border-blue-600">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold">
              💡 <strong>Tip:</strong> Use sliders to fine-tune voice characteristics. Higher values make the voice more expressive, faster, louder, and more responsive.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis & Advanced Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
          <h4 className="font-bold text-gray-900 dark:text-white">Analysis & Advanced Settings</h4>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg border border-gray-300 dark:border-gray-600 space-y-4">
          {/* Post Call Analysis Model */}
          <div>
            <Label htmlFor="post_call_analysis_model" className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Post-Call Analysis Model
            </Label>
            <Select
              value={formData.post_call_analysis_model}
              onValueChange={(value) => updateFormData('post_call_analysis_model', value)}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-white font-medium">
                <SelectValue placeholder="Select analysis model" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500">
                {POST_CALL_ANALYSIS_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-gray-900 dark:text-white font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">{model.name}</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">{model.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium">
              LLM cost per minute. See <a href="https://www.retellai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">official pricing</a>
            </p>
          </div>

          {/* Post Call Analysis Data */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
              Post-Call Analysis Data Fields
            </Label>
            <div className="space-y-3">
              {formData.post_call_analysis_data.map((field, index) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => {
                        const newData = [...formData.post_call_analysis_data];
                        newData[index].name = e.target.value;
                        updateFormData('post_call_analysis_data', newData);
                      }}
                      className="text-sm"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) => {
                        const newData = [...formData.post_call_analysis_data];
                        newData[index].type = value;
                        updateFormData('post_call_analysis_data', newData);
                      }}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Description"
                    value={field.description}
                    onChange={(e) => {
                      const newData = [...formData.post_call_analysis_data];
                      newData[index].description = e.target.value;
                      updateFormData('post_call_analysis_data', newData);
                    }}
                    className="text-sm mb-2"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Example values (comma-separated)"
                      value={field.examples.join(', ')}
                      onChange={(e) => {
                        const newData = [...formData.post_call_analysis_data];
                        newData[index].examples = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        updateFormData('post_call_analysis_data', newData);
                      }}
                      className="text-sm flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newData = formData.post_call_analysis_data.filter((_, i) => i !== index);
                        updateFormData('post_call_analysis_data', newData);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newData = [...formData.post_call_analysis_data, {
                    type: 'string',
                    name: '',
                    description: '',
                    examples: []
                  }];
                  updateFormData('post_call_analysis_data', newData);
                }}
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Analysis Field
              </Button>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 font-medium">Define custom data fields to extract from call analysis</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-300 dark:border-gray-600">
        <Button
          onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
          disabled={!formData.agent_name.trim() || isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white font-bold py-3 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border border-blue-800"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
              {editingAgent ? 'Updating...' : 'Creating...'}
            </>
          ) : editingAgent ? (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Update Agent
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={resetForm}
          className="px-6 py-3 border-2 border-gray-500 dark:border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-gray-900 dark:text-white font-semibold bg-white dark:bg-gray-800"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Retell Agents</h2>
          <p className="text-gray-800 dark:text-gray-200 font-medium">Manage your AI voice agents</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-200 border border-blue-800"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading agents...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Agents</h3>
          <p className="text-red-600 dark:text-red-400 mb-4 max-w-md mx-auto">{error}</p>
          <Button onClick={loadAgents} variant="outline" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
            Try Again
          </Button>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.agent_id} className="relative group hover:shadow-xl transition-all duration-200 border-2 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-900 shadow-lg">
            <CardHeader className="pb-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-lg border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center border border-blue-300 dark:border-blue-600">
                    <Bot className="w-5 h-5 text-blue-800 dark:text-blue-200" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      {agent.agent_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border-gray-400 dark:border-gray-500 font-semibold">
                        {agent.language}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-600 font-semibold">
                        {agent.voice_id?.includes('eleven_') ? 'ElevenLabs' : 'OpenAI'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
              <div className="space-y-4">
                {/* Agent Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Status</span>
                  <Badge variant="outline" className="bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 border-green-400 dark:border-green-600 font-bold">
                    Active
                  </Badge>
                </div>
                
                {/* Prompt Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Configuration</span>
                  {agent.response_engine?.prompt ? (
                    <Badge variant="outline" className="bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-600 font-bold">
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600 font-bold">
                      No prompt configured
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsageAgent(agent)}
                          className="bg-purple-200 text-purple-900 border-purple-400 hover:bg-purple-300 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-600 dark:hover:bg-purple-700 font-bold shadow-md hover:shadow-lg"
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        View usage & costs
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestingAgent(agent)}
                    className="flex-1 bg-green-200 text-green-900 border-green-400 hover:bg-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600 dark:hover:bg-green-700 font-bold shadow-md hover:shadow-lg"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(agent)}
                    className="flex-1 bg-blue-200 text-blue-900 border-blue-400 hover:bg-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600 dark:hover:bg-blue-700 font-bold shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent)}
                    className="bg-red-200 text-red-900 border-red-400 hover:bg-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600 dark:hover:bg-red-700 font-bold shadow-md hover:shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {agents.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">No agents yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Create your first AI voice agent to get started with intelligent conversations
          </p>
          <Button 
            onClick={openCreateDialog}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Agent
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="sr-only">Create New Agent</DialogTitle>
          </DialogHeader>
          <div key="create-form">
            {renderAgentForm()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="sr-only">Edit Agent</DialogTitle>
          </DialogHeader>
          <div key={editingAgent?.agent_id || 'edit-form'}>
            {renderAgentForm()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={!!testingAgent} onOpenChange={() => setTestingAgent(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600">
          <DialogHeader className="pb-4 border-b border-gray-300 dark:border-gray-600">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Test Agent: {testingAgent?.agent_name}
            </DialogTitle>
          </DialogHeader>
          {testingAgent && (
            <div className="py-4">
              <RetellVoiceCall
                agentId={testingAgent.agent_id}
                agentName={testingAgent.agent_name}
                showTranscript={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Usage Modal */}
      {usageAgent && (
        <RetellUsageModal
          isOpen={!!usageAgent}
          onClose={() => setUsageAgent(null)}
          agent={usageAgent}
        />
      )}


    </div>
  );
}

export default RetellAgentManager; 