import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { 
  DollarSign, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  Zap,
  Calendar,
  BarChart3,
  Phone,
  Bot,
  VolumeX,
  RefreshCw
} from 'lucide-react';
import { retellService, RetellAgent, RetellCall } from '../services/retellService';
import { toast } from 'sonner';

interface RetellUsageData {
  totalCalls: number;
  totalMinutes: number;
  todayCalls: number;
  todayMinutes: number;
  avgCallDuration: number;
  costPerMinute: number;
  totalCost: number;
  todayCost: number;
  monthlyLimit: number;
  monthlyUsed: number;
  successfulCalls: number;
  voicemailCalls: number;
  avgSentiment: string;
}

interface RetellUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: RetellAgent;
}

// Retell AI official pricing structure: Voice Engine + LLM + Telephony
// Source: https://www.retellai.com/pricing

const VOICE_ENGINE_PRICING: { [key: string]: number } = {
  // ElevenLabs voices
  'eleven_turbo_v2': 0.07,
  'eleven_multilingual_v2': 0.07,
  'eleven_flash_v2': 0.07,
  'elevenlabs': 0.07, // Default ElevenLabs pricing
  // OpenAI voices  
  'openai-alloy': 0.08,
  'openai-echo': 0.08,
  'openai-fable': 0.08,
  'openai-onyx': 0.08,
  'openai-nova': 0.08,
  'openai-shimmer': 0.08,
  'tts-1': 0.08,
  'tts-1-hd': 0.08,
};

const LLM_PRICING: { [key: string]: number } = {
  'gpt-4o': 0.05,
  'gpt-4o-mini': 0.006,
  'gpt-4.1': 0.045,
  'gpt-4.1-mini': 0.016,
  'gpt-4.1-nano': 0.004,
  'gpt-4o-realtime': 0.50, // Speech-to-speech
  'gpt-4o-mini-realtime': 0.125, // Speech-to-speech
  'claude-3.7-sonnet': 0.06,
  'claude-3.5-haiku': 0.02,
  'gemini-2.0-flash': 0.006,
  'gemini-2.0-flash-lite': 0.003,
  // Default fallback
  'default': 0.006
};

const TELEPHONY_COST = 0.015; // Retell Twilio telephony cost per minute
const KNOWLEDGE_BASE_ADDON = 0.005; // Additional cost when using knowledge base

// Calculate total cost per minute based on Retell's pricing structure
function calculateCostPerMinute(agent: RetellAgent): number {
  // Voice Engine cost (based on voice provider)
  let voiceEngineCost = 0.07; // Default ElevenLabs
  if (agent.voice_id) {
    if (agent.voice_id.includes('openai') || agent.voice_id.includes('tts-')) {
      voiceEngineCost = 0.08; // OpenAI voices
    } else {
      voiceEngineCost = VOICE_ENGINE_PRICING[agent.voice_model || 'elevenlabs'] || 0.07;
    }
  }

  // LLM cost (based on post_call_analysis_model or default)
  const llmModel = agent.post_call_analysis_model || 'gpt-4o-mini';
  const llmCost = LLM_PRICING[llmModel] || 0.006; // Default to gpt-4o-mini cost

  // Telephony cost (fixed)
  const telephonyCost = TELEPHONY_COST;

  // Knowledge base addon (if applicable)
  const knowledgeBaseCost = 0; // Would need to check if agent uses knowledge base

  return voiceEngineCost + llmCost + telephonyCost + knowledgeBaseCost;
}

// Mock function to simulate Retell usage data (in real app, this would fetch from Retell API)
function generateRetellUsageData(agent: RetellAgent): RetellUsageData {
  const totalCalls = Math.floor(Math.random() * 200) + 50;
  const totalMinutes = Math.floor(Math.random() * 800) + 200;
  const costPerMinute = calculateCostPerMinute(agent);
  
  return {
    totalCalls,
    totalMinutes,
    todayCalls: Math.floor(Math.random() * 15) + 3,
    todayMinutes: Math.floor(Math.random() * 45) + 10,
    avgCallDuration: Math.floor(totalMinutes / totalCalls * 10) / 10,
    costPerMinute,
    totalCost: totalMinutes * costPerMinute,
    todayCost: 0, // Will be calculated
    monthlyLimit: 2000,
    monthlyUsed: Math.floor(Math.random() * 1500) + 300,
    successfulCalls: Math.floor(totalCalls * 0.85),
    voicemailCalls: Math.floor(totalCalls * 0.15),
    avgSentiment: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)]
  };
}

export function RetellUsageModal({ isOpen, onClose, agent }: RetellUsageModalProps) {
  const [usageData, setUsageData] = useState<RetellUsageData>(() => {
    const data = generateRetellUsageData(agent);
    data.todayCost = data.todayMinutes * data.costPerMinute;
    return data;
  });
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [lastUsageSnapshot, setLastUsageSnapshot] = useState<string>('');
  const [pollInterval, setPollInterval] = useState(10000); // Start with 10s
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  // Smart polling with usage change detection and adaptive intervals
  const loadCallData = async (isManual = false) => {
    if (!retellService.isConfigured()) return null;

    setLoadingCalls(true);
    if (isManual) {
      setIsManualRefresh(true);
    }

    try {
      console.log(`📊 Fetching usage data (${isManual ? 'manual' : 'auto'} refresh)...`);
      
      // IMPORTANT: This API call to fetch usage data is NOT billable
      // Only actual calls (web_call, phone_call) are billable according to Retell API docs
      const allCalls = await retellService.listCalls(50); // Get last 50 calls
      
      // Filter for this agent's calls AND only count billable call types
      const agentCalls = allCalls.filter(call => 
        call.agent_id === agent.agent_id &&
        // Only count actual billable calls: web_call and phone_call
        // Based on Retell API docs: both web calls and phone calls are billable
        (call.call_type === 'web_call' || call.call_type === 'phone_call') &&
        // Only count calls that actually connected and had valid duration
        call.call_status === 'ended' &&
        call.start_timestamp && 
        call.end_timestamp &&
        call.end_timestamp > call.start_timestamp &&
        // Filter out very short calls (likely connection errors)
        (call.end_timestamp - call.start_timestamp) >= 6000 // At least 6 seconds
      );
      
      // Create usage snapshot for change detection
      const usageSnapshot = JSON.stringify({
        callCount: agentCalls.length,
        callIds: agentCalls.map(c => c.call_id).sort(),
        lastCallTime: agentCalls.length > 0 ? Math.max(...agentCalls.map(c => c.end_timestamp || 0)) : 0
      });

      // Check if usage has actually changed
      const hasUsageChanged = lastUsageSnapshot !== usageSnapshot;
      
      if (!hasUsageChanged && !isManual) {
        console.log('📊 No usage changes detected, skipping update');
        return { hasUsageChanged: false, newSnapshot: usageSnapshot };
      }

      console.log(`📊 Usage ${hasUsageChanged ? 'changed' : 'manually refreshed'}, updating data...`);
      setCalls(agentCalls);

      // Calculate real usage data ONLY from billable voice calls
      if (agentCalls.length > 0) {
        // Use actual call costs from Retell API if available, otherwise calculate
        let totalActualCost = 0;
        let hasActualCostData = false;

        const totalMinutes = agentCalls.reduce((acc, call) => {
          // Double-check: only count calls with valid duration
          if (call.start_timestamp && call.end_timestamp && call.end_timestamp > call.start_timestamp) {
            const callDuration = (call.end_timestamp - call.start_timestamp) / 60000; // Convert to minutes
            
            // Use actual cost data from Retell API if available (call_cost.combined_cost)
            if (call.call_cost?.combined_cost) {
              totalActualCost += call.call_cost.combined_cost;
              hasActualCostData = true;
            }
            
            // Only count calls longer than a few seconds (filter out connection errors)
            return callDuration > 0.1 ? acc + callDuration : acc;
          }
          return acc;
        }, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Only count today's billable calls
        const todayCalls = agentCalls.filter(call => 
          call.start_timestamp && 
          new Date(call.start_timestamp) >= today &&
          // Ensure it's a completed billable call
          call.call_status === 'ended' &&
          call.end_timestamp &&
          call.end_timestamp > call.start_timestamp
        );

        let todayActualCost = 0;
        const todayMinutes = todayCalls.reduce((acc, call) => {
          if (call.start_timestamp && call.end_timestamp && call.end_timestamp > call.start_timestamp) {
            const callDuration = (call.end_timestamp - call.start_timestamp) / 60000;
            
            // Use actual cost data for today's calls if available
            if (call.call_cost?.combined_cost) {
              todayActualCost += call.call_cost.combined_cost;
            }
            
            // Only count calls longer than a few seconds
            return callDuration > 0.1 ? acc + callDuration : acc;
          }
          return acc;
        }, 0);

        const costPerMinute = calculateCostPerMinute(agent);
        const successfulCalls = agentCalls.filter(call => 
          call.call_analysis?.call_successful !== false
        ).length;
        const voicemailCalls = agentCalls.filter(call => 
          call.call_analysis?.in_voicemail === true
        ).length;

        // Use actual costs if available from Retell API, otherwise use calculated costs
        const finalTotalCost = hasActualCostData ? totalActualCost : (totalMinutes * costPerMinute);
        const finalTodayCost = hasActualCostData ? todayActualCost : (todayMinutes * costPerMinute);
        const effectiveCostPerMinute = hasActualCostData && totalMinutes > 0 ? (totalActualCost / totalMinutes) : costPerMinute;

        setUsageData({
          totalCalls: agentCalls.length,
          totalMinutes: Math.round(totalMinutes * 10) / 10,
          todayCalls: todayCalls.length,
          todayMinutes: Math.round(todayMinutes * 10) / 10,
          avgCallDuration: agentCalls.length > 0 ? Math.round((totalMinutes / agentCalls.length) * 10) / 10 : 0,
          costPerMinute: Math.round(effectiveCostPerMinute * 1000) / 1000, // Round to 3 decimals
          totalCost: Math.round(finalTotalCost * 100) / 100, // Round to 2 decimals
          todayCost: Math.round(finalTodayCost * 100) / 100,
          monthlyLimit: 2000,
          monthlyUsed: Math.round(totalMinutes),
          successfulCalls,
          voicemailCalls,
          avgSentiment: agentCalls.length > 0 ? 'Positive' : 'No data'
        });

        if (hasUsageChanged) {
          setIsLive(true);
          setTimeout(() => setIsLive(false), 1000);
        }
      }

      return { hasUsageChanged, newSnapshot: usageSnapshot };
          } catch (error) {
        console.error('Failed to load call data:', error);
        
        // Check if it's an API endpoint error
        if ((error as any)?.response?.status === 404) {
          console.warn('📊 Retell API endpoint not found - using mock data for demo');
          if (isManual) {
            toast.error('Retell API not accessible - showing demo data');
          }
        } else if ((error as any)?.code === 'ERR_BAD_REQUEST') {
          console.warn('📊 Retell API request failed - check API key configuration');
          if (isManual) {
            toast.error('Retell API authentication failed');
          }
        } else {
          if (isManual) {
            toast.error('Failed to refresh usage data');
          }
        }
        return null;
    } finally {
      setLoadingCalls(false);
      setIsManualRefresh(false);
    }
  };

  // Initial load when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    loadCallData(true).then(result => {
      if (result) {
        setLastUsageSnapshot(result.newSnapshot);
        setPollInterval(10000); // Reset to 10s
      }
    });
  }, [isOpen, agent.agent_id]);

  // Smart adaptive polling with backoff strategy
  useEffect(() => {
    if (!isOpen) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextPoll = () => {
      timeoutId = setTimeout(async () => {
        console.log(`📊 Auto-polling usage data (interval: ${pollInterval}ms)...`);
        
        const result = await loadCallData(false);
        
        if (result) {
          if (result.hasUsageChanged) {
            // Usage changed - reset to frequent polling
            console.log('📊 Usage changed! Resetting to 10s polling');
            setLastUsageSnapshot(result.newSnapshot);
            setPollInterval(10000);
          } else {
            // No change - implement backoff strategy
            const nextInterval = pollInterval === 10000 ? 30000 : Math.min(pollInterval * 1.5, 120000); // Max 2 minutes
            console.log(`📊 No changes, backing off to ${nextInterval}ms`);
            setPollInterval(nextInterval);
          }
        }
        
        // Schedule next poll
        scheduleNextPoll();
      }, pollInterval);
    };

    // Start polling
    scheduleNextPoll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, pollInterval, lastUsageSnapshot]);

  const usagePercentage = (usageData.monthlyUsed / usageData.monthlyLimit) * 100;
  const successRate = usageData.totalCalls > 0 ? (usageData.successfulCalls / usageData.totalCalls) * 100 : 0;

  // Manual refresh handler
  const handleManualRefresh = async () => {
    console.log('📊 Manual refresh triggered');
    const result = await loadCallData(true);
    if (result) {
      setLastUsageSnapshot(result.newSnapshot);
      setPollInterval(10000); // Reset to frequent polling after manual refresh
      toast.success('Usage data refreshed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <DialogTitle className="flex items-center gap-2">
                Retell Agent Analytics
                {isLive && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse" />
                    Live Update
                  </Badge>
                )}
                <Badge variant="outline" className="text-blue-600 text-xs">
                  Poll: {pollInterval/1000}s
                </Badge>
              </DialogTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={loadingCalls}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${loadingCalls || isManualRefresh ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <DialogDescription>
            Smart polling with usage change detection for <strong>{agent.agent_name}</strong> (web calls + phone calls)
            {loadingCalls && <span className="text-blue-600"> • Fetching latest data...</span>}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Agent Info */}
                     <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
             <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                 <Bot className="w-6 h-6 text-white" />
               </div>
               <div className="flex-1">
                 <h3 className="font-semibold">{agent.agent_name}</h3>
                 <div className="flex items-center gap-2 mt-1">
                   <Badge variant="outline">{agent.language}</Badge>
                   <Badge variant="outline">{agent.voice_model || 'eleven_turbo_v2'}</Badge>
                   <Badge variant="outline" className="text-green-600 font-bold">
                     ${usageData.costPerMinute.toFixed(3)}/min
                   </Badge>
                 </div>
               </div>
               {loadingCalls && (
                 <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
               )}
             </div>
             
             {/* Cost Breakdown */}
             <div className="text-xs text-muted-foreground">
               <div className="flex items-center justify-between mb-1">
                 <p className="font-medium">Cost Breakdown (per minute):</p>
                 <Badge variant="outline" className={`text-xs ${calls.some(c => c.call_cost?.combined_cost) ? 'text-green-600 border-green-600' : 'text-orange-600 border-orange-600'}`}>
                   {calls.some(c => c.call_cost?.combined_cost) ? 'Actual API Costs' : 'Estimated Costs'}
                 </Badge>
               </div>
               <div className="grid grid-cols-3 gap-2">
                 <div>Voice Engine: ${(agent.voice_id?.includes('openai') || agent.voice_id?.includes('tts-') ? 0.08 : 0.07).toFixed(3)}</div>
                 <div>LLM: ${(LLM_PRICING[agent.post_call_analysis_model || 'gpt-4o-mini'] || 0.006).toFixed(3)}</div>
                 <div>Telephony: ${TELEPHONY_COST.toFixed(3)}</div>
               </div>
               {calls.some(c => c.call_cost?.combined_cost) && (
                 <p className="mt-2 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-400">
                   <strong>✓ Using Retell API actual costs:</strong> Costs shown are based on real billing data from call_cost.combined_cost
                 </p>
               )}
               {calls.some(c => c.llm_token_usage?.average) && (
                 <p className="mt-1 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-2 border-blue-400">
                   <strong>LLM Token Usage:</strong> Avg {Math.round(calls.filter(c => c.llm_token_usage?.average).reduce((sum, c) => sum + (c.llm_token_usage?.average || 0), 0) / calls.filter(c => c.llm_token_usage?.average).length || 0)} tokens per request ({calls.filter(c => c.llm_token_usage?.average).length} calls with data)
                 </p>
               )}
               <p className="mt-2 text-xs bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-400">
                 <strong>Note:</strong> Only actual calls (web_call + phone_call) are billable. API calls for usage monitoring are free. Calls shorter than 6 seconds are filtered out.
               </p>
               <p className="mt-1 text-xs">
                 <a href="https://www.retellai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                   View official Retell pricing
                 </a>
               </p>
             </div>
           </div>

          {/* Real-time metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Today's Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageData.todayCalls}</div>
                <p className="text-xs text-muted-foreground">
                  {usageData.todayMinutes.toFixed(1)} minutes total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Today's Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${usageData.todayCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${usageData.costPerMinute}/minute
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Total stats */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              All-time Statistics
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{usageData.totalCalls}</div>
                <p className="text-xs text-muted-foreground">Total Calls</p>
                {calls.length > 0 && (
                  <div className="flex gap-1 justify-center mt-1">
                    {calls.filter(c => c.call_type === 'web_call').length > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Web: {calls.filter(c => c.call_type === 'web_call').length}
                      </Badge>
                    )}
                    {calls.filter(c => c.call_type === 'phone_call').length > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Phone: {calls.filter(c => c.call_type === 'phone_call').length}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold">{usageData.totalMinutes.toFixed(1)}m</div>
                <p className="text-xs text-muted-foreground">Total Minutes</p>
              </div>
              <div>
                <div className="text-lg font-semibold">${usageData.totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </div>
              <div>
                <div className="text-lg font-semibold">{usageData.avgCallDuration.toFixed(1)}m</div>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Call Quality & Performance */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Call Quality & Performance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm font-bold text-green-600">{successRate.toFixed(1)}%</span>
                </div>
                <Progress value={successRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {usageData.successfulCalls} successful calls
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <VolumeX className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Voicemail Rate</span>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {usageData.totalCalls > 0 ? ((usageData.voicemailCalls / usageData.totalCalls) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {usageData.voicemailCalls} voicemail calls
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Monthly usage */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Monthly Usage Limit
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Minutes Used</span>
                <span>{usageData.monthlyUsed} / {usageData.monthlyLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usagePercentage.toFixed(1)}% used</span>
                <span>{usageData.monthlyLimit - usageData.monthlyUsed} remaining</span>
              </div>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Cost Efficiency</span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                ${usageData.totalCalls > 0 ? (usageData.totalCost / usageData.totalCalls).toFixed(2) : '0.00'}/call
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Avg Sentiment</span>
              </div>
              <div className="text-lg font-semibold">
                {usageData.avgSentiment}
              </div>
            </div>
          </div>

          {/* Polling Strategy Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Smart Polling Strategy</h4>
              <Badge variant="outline" className={`text-xs ${retellService.isConfigured() ? 'text-green-600 border-green-600' : 'text-gray-600 border-gray-600'}`}>
                {retellService.isConfigured() ? 'Live API Data' : 'Demo Mode'}
              </Badge>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>• Checks for usage changes every {pollInterval/1000} seconds</p>
              <p>• Auto-backs off to 30s → 45s → 60s → 120s when no changes detected</p>
              <p>• Resets to 10s polling when new calls are detected</p>
              <p>• Manual refresh always fetches latest data immediately</p>
              <p className="text-green-600 dark:text-green-400">✓ Only billable calls count toward usage metrics (web_call + phone_call)</p>
              {calls.some(c => c.call_cost?.combined_cost) && (
                <p className="text-green-600 dark:text-green-400">✓ Using real Retell API cost data (call_cost.combined_cost)</p>
              )}
              {calls.some(c => c.llm_token_usage?.average) && (
                <p className="text-blue-600 dark:text-blue-400">• LLM token usage data available from API ({calls.filter(c => c.llm_token_usage?.average).length} calls)</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Call History
            </Button>
            <Button variant="outline" className="flex-1">
              Export Analytics
            </Button>
          </div>

          {/* Data source indicator */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
            <h4 className="font-medium text-sm mb-2">Data Source</h4>
            <div className="text-xs text-muted-foreground">
              {calls.length > 0 ? (
                <div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✅ Real data from Retell API ({calls.length} billable calls)
                  </p>
                  <p className="mt-1">
                    Call types: {calls.filter(c => c.call_type === 'web_call').length} web calls, {' '}
                    {calls.filter(c => c.call_type === 'phone_call').length} phone calls
                  </p>
                  <p className="mt-1">
                    ✓ Filtered: Only completed voice calls longer than 6 seconds
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    📊 Mock data for demonstration (no real calls found)
                  </p>
                  <p className="mt-1">
                    {retellService.isConfigured() 
                      ? 'No completed calls found for this agent yet'
                      : 'Configure Retell API key to see real data'
                    }
                  </p>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <strong>Note:</strong> Only actual voice calls count as billable usage. 
                API monitoring calls are free.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 