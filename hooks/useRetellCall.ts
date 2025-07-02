import { useState, useCallback, useRef, useEffect } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { retellService } from '../services/retellService';

export interface UseRetellCallOptions {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onCallError?: (error: Error) => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

export interface CallState {
  isConnected: boolean;
  isConnecting: boolean;
  callId?: string;
  error?: string;
  transcript?: string;
  callDuration: number;
}

export function useRetellCall(options: UseRetellCallOptions = {}) {
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isConnecting: false,
    callDuration: 0,
  });

  const retellWebClientRef = useRef<RetellWebClient | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  // Helper function to safely convert transcript data to string
  const safeTranscriptToString = useCallback((transcriptData: any): string => {
    if (!transcriptData) return '';
    
    if (typeof transcriptData === 'string') {
      return transcriptData;
    }
    
    if (Array.isArray(transcriptData)) {
      return transcriptData
        .map((msg: any) => {
          if (typeof msg === 'string') return msg;
          if (msg && typeof msg === 'object') {
            if (msg.content) {
              const role = msg.role === 'user' ? 'You' : 'Agent';
              return `${role}: ${msg.content}`;
            }
            return JSON.stringify(msg);
          }
          return String(msg);
        })
        .filter(Boolean)
        .join('\n');
    }
    
    if (typeof transcriptData === 'object') {
      if (transcriptData.content) {
        const role = transcriptData.role === 'user' ? 'You' : 'Agent';
        return `${role}: ${transcriptData.content}`;
      }
      return JSON.stringify(transcriptData);
    }
    
    return String(transcriptData);
  }, []);

  // Initialize Retell Web Client
  const initializeRetellClient = useCallback(() => {
    if (!retellWebClientRef.current) {
      retellWebClientRef.current = new RetellWebClient();

      // Set up event listeners
      retellWebClientRef.current.on("call_started", () => {
        console.log("✅ Call started");
        setCallState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          error: undefined
        }));
        startDurationTracking();
        options.onCallStart?.();
      });

      retellWebClientRef.current.on("call_ended", () => {
        console.log("📞 Call ended");
        setCallState(prev => ({ 
          ...prev, 
          isConnected: false,
          isConnecting: false
        }));
        stopDurationTracking();
        options.onCallEnd?.();
      });

      retellWebClientRef.current.on("agent_start_talking", () => {
        console.log("🗣️ Agent started talking");
      });

      retellWebClientRef.current.on("agent_stop_talking", () => {
        console.log("🤐 Agent stopped talking");
      });

      retellWebClientRef.current.on("update", (update) => {
        console.log("📨 Update received:", update);
        
        // Handle transcript updates using safe conversion
        if (update.transcript) {
          console.log("📝 Transcript data type:", typeof update.transcript);
          console.log("📝 Transcript data:", update.transcript);
          
          const transcriptText = safeTranscriptToString(update.transcript);
          console.log("📝 Converted transcript:", transcriptText);
          
          setCallState(prev => ({ 
            ...prev, 
            transcript: transcriptText 
          }));
          options.onTranscriptUpdate?.(transcriptText);
        }
      });

      retellWebClientRef.current.on("metadata", (metadata) => {
        console.log("📋 Metadata received:", metadata);
      });

      retellWebClientRef.current.on("error", (error) => {
        console.error("❌ Retell client error:", error);
        setCallState(prev => ({ 
          ...prev, 
          error: `Call error: ${error.message || 'Unknown error'}`,
          isConnected: false,
          isConnecting: false
        }));
        options.onCallError?.(error);
      });

      console.log("✅ Retell Web Client initialized");
    }
  }, [options]);

  // Start duration tracking
  const startDurationTracking = useCallback(() => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallState(prev => ({ ...prev, callDuration: elapsed }));
      }
    }, 1000);
  }, []);

  // Stop duration tracking
  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartTimeRef.current = null;
  }, []);

  // Start a new call
  const startCall = useCallback(async (agentId: string) => {
    try {
      console.log('🚀 Starting call with agent:', agentId);
      setCallState(prev => ({ 
        ...prev, 
        isConnecting: true, 
        error: undefined,
        transcript: undefined,
        callDuration: 0
      }));

      // Initialize Retell client if not already done
      initializeRetellClient();

      // Create web call to get access token
      const callResponse = await retellService.createWebCall({
        agent_id: agentId,
      });

      console.log('📞 Call created:', callResponse);
      setCallState(prev => ({ 
        ...prev, 
        callId: callResponse.call_id 
      }));

      // Start the call using Retell Web Client
      if (retellWebClientRef.current) {
        await retellWebClientRef.current.startCall({
          accessToken: callResponse.access_token,
          sampleRate: 24000,
          captureDeviceId: "default",
          playbackDeviceId: "default",
          emitRawAudioSamples: false,
        });
        console.log('🎉 Call started successfully');
      } else {
        throw new Error('Retell Web Client not initialized');
      }

    } catch (error) {
      console.error('❌ Failed to start call:', error);
      let errorMessage = 'Failed to start call. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = 'Agent not found. Please check the agent ID and try again.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Authentication failed. Please check your API key.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('NotAllowedError')) {
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
        } else if (error.message.includes('NotFoundError')) {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCallState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isConnecting: false 
      }));
      options.onCallError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [initializeRetellClient, options]);

  // End the current call
  const endCall = useCallback(() => {
    console.log('📞 Ending call...');
    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall();
    }
    cleanup();
  }, []);

  // Cleanup resources
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up call resources...');
    
    stopDurationTracking();
    
    setCallState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      callId: undefined,
      transcript: undefined,
      callDuration: 0,
      error: undefined
    }));
  }, [stopDurationTracking]);

  // Get call details
  const getCallDetails = useCallback(async (callId: string): Promise<any | null> => {
    try {
      return await retellService.getCall(callId);
    } catch (error) {
      console.error('Error fetching call details:', error);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retellWebClientRef.current) {
        retellWebClientRef.current.stopCall();
      }
      cleanup();
    };
  }, [cleanup]);

  // Format call duration
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    callState,
    startCall,
    endCall,
    getCallDetails,
    formatDuration: formatDuration(callState.callDuration),
    isCallActive: callState.isConnected || callState.isConnecting,
  };
} 