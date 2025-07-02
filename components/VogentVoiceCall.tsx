import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useVogentCall } from '../hooks/useVogentCall';

interface VogentVoiceCallProps {
  agentId: string;
  agentName?: string;
  className?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

export function VogentVoiceCall({
  agentId,
  agentName = 'Vogent Agent',
  className = '',
  onCallStart,
  onCallEnd,
}: VogentVoiceCallProps) {
  console.log('🎬 [COMPONENT] VogentVoiceCall component rendered with agentId:', agentId);
  
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const {
    callState,
    startCall,
    endCall,
    formatDuration,
    isCallActive,
    setMicrophoneMuted,
    setSpeakerVolume,
  } = useVogentCall({
    onCallStart: () => {
      console.log('📢 [COMPONENT] onCallStart callback triggered');
      toast.success(`Connected to ${agentName}`);
      onCallStart?.();
    },
    onCallEnd: () => {
      console.log('📢 [COMPONENT] onCallEnd callback triggered - this causes the toast!');
      console.trace('🔍 [COMPONENT] onCallEnd trace:');
      toast.info('Call ended');
      onCallEnd?.();
    },
    onCallError: (error) => {
      console.log('📢 [COMPONENT] onCallError callback triggered:', error.message);
      toast.error(`Call error: ${error.message}`);
    },
  });

  const handleStartCall = async () => {
    try {
      console.log('🎯 [COMPONENT] Start call button clicked for agent:', agentId);
      await startCall(agentId);
      console.log('🎯 [COMPONENT] Start call completed');
    } catch (error) {
      console.error('❌ [COMPONENT] Failed to start Vogent call:', error);
    }
  };

  const handleEndCall = () => {
    console.log('🎯 [COMPONENT] End call button clicked');
    endCall();
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setMicrophoneMuted(newMutedState);
    toast.info(newMutedState ? 'Microphone muted' : 'Microphone unmuted');
  };

  const toggleVolume = () => {
    const newVolume = volume > 0 ? 0 : 1;
    setVolume(newVolume);
    setSpeakerVolume(newVolume);
    toast.info(newVolume > 0 ? 'Speaker enabled' : 'Speaker muted');
  };

  const getCallStatusBadge = () => {
    if (callState.isConnecting) {
      return <Badge variant="secondary" className="animate-pulse bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600 font-bold">Connecting...</Badge>;
    }
    if (callState.isConnected) {
      return <Badge variant="default" className="bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 border-green-400 dark:border-green-600 font-bold">Connected</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border-gray-400 dark:border-gray-500 font-bold">Ready</Badge>;
  };

  const getCallStatusColor = () => {
    if (callState.isConnecting) return 'text-yellow-600 dark:text-yellow-400';
    if (callState.isConnected) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className={`w-full max-w-md mx-auto border-2 shadow-xl bg-white dark:bg-gray-900 ${className}`}>
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-900 rounded-t-lg border-b-2 border-green-300 dark:border-green-600">
        <CardTitle className="flex items-center justify-center gap-2 text-lg font-bold">
          <Phone className={`w-6 h-6 ${getCallStatusColor()}`} />
          <span className="text-gray-900 dark:text-white">{agentName}</span>
        </CardTitle>
        <div className="flex items-center justify-center gap-3 mt-2">
          {getCallStatusBadge()}
          {callState.isConnected && (
            <Badge variant="outline" className="font-mono text-sm bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-400 dark:border-blue-600 font-bold">
              {formatDuration}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6 bg-white dark:bg-gray-900">
        {/* Call Controls */}
        <div className="flex justify-center gap-4">
          {!isCallActive ? (
            <Button
              onClick={handleStartCall}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-20 h-20 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              disabled={callState.isConnecting}
            >
              <Phone className="w-8 h-8" />
            </Button>
          ) : (
            <Button
              onClick={handleEndCall}
              size="lg"
              variant="destructive"
              className="rounded-full w-20 h-20 shadow-lg hover:shadow-xl transition-all duration-200 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
          )}
        </div>

        {/* Audio Controls */}
        {isCallActive && (
          <div className="flex justify-center gap-3">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "outline"}
              size="sm"
              className={`rounded-full w-12 h-12 transition-all duration-200 ${
                isMuted 
                  ? 'bg-red-200 text-red-900 border-red-400 hover:bg-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600 font-bold' 
                  : 'bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500 font-bold'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              onClick={toggleVolume}
              variant={volume === 0 ? "destructive" : "outline"}
              size="sm"
              className={`rounded-full w-12 h-12 transition-all duration-200 ${
                volume === 0 
                  ? 'bg-red-200 text-red-900 border-red-400 hover:bg-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600 font-bold' 
                  : 'bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500 font-bold'
              }`}
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        )}

        {/* Error Display */}
        {callState.error && (
          <div className="text-center text-sm text-red-900 dark:text-red-100 bg-red-200 dark:bg-red-800 p-4 rounded-lg border-2 border-red-400 dark:border-red-600 font-bold">
            <div className="font-bold mb-1">Call Error</div>
            {callState.error}
          </div>
        )}

        {/* Call Info */}
        {callState.dialId && (
          <div className="text-center text-xs text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 p-3 rounded border-2 border-gray-300 dark:border-gray-600 font-semibold">
            <div><span className="font-bold">Dial ID:</span> {callState.dialId.slice(0, 8)}...</div>
            {callState.sessionId && (
              <div className="mt-1"><span className="font-bold">Session:</span> {callState.sessionId.slice(0, 8)}...</div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isCallActive && (
          <div className="text-center text-sm text-green-900 dark:text-green-100 bg-green-200 dark:bg-green-800 p-4 rounded-lg border-2 border-green-400 dark:border-green-600">
            <p className="font-bold text-green-900 dark:text-green-100">Click the phone button to start testing {agentName}</p>
            <p className="text-xs mt-2 text-green-800 dark:text-green-200 font-semibold">Browser call will be initiated via Vogent</p>
            <p className="text-xs mt-1 text-green-700 dark:text-green-300 font-medium">Check console for detailed connection logs</p>
          </div>
        )}
        
        {/* Audio Status */}
        {isCallActive && (
          <div className="text-center text-xs text-blue-900 dark:text-blue-100 bg-blue-200 dark:bg-blue-800 p-3 rounded border-2 border-blue-400 dark:border-blue-600">
            <p className="font-bold">🔊 Audio Connection Status</p>
            <p className="mt-1">Call established - Check browser console for audio details</p>
            <p className="mt-1 text-blue-800 dark:text-blue-200">If no audio: This indicates Vogent may require a WebSDK</p>
          </div>
        )}

        {/* Vogent Branding */}
        <div className="text-center">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-600 font-bold">
            Powered by Vogent
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 