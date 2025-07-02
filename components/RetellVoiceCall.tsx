import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useRetellCall } from '../hooks/useRetellCall';

interface RetellVoiceCallProps {
  agentId: string;
  agentName?: string;
  className?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  showTranscript?: boolean;
}

export function RetellVoiceCall({
  agentId,
  agentName = 'AI Agent',
  className = '',
  onCallStart,
  onCallEnd,
  showTranscript = true,
}: RetellVoiceCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const {
    callState,
    startCall,
    endCall,
    formatDuration,
    isCallActive,
  } = useRetellCall({
    onCallStart: () => {
      toast.success(`Connected to ${agentName}`);
      onCallStart?.();
    },
    onCallEnd: () => {
      toast.info('Call ended');
      onCallEnd?.();
    },
    onCallError: (error) => {
      toast.error(`Call error: ${error.message}`);
    },
    onTranscriptUpdate: (transcript) => {
      console.log('Transcript update:', transcript);
    },
  });

  const handleStartCall = async () => {
    try {
      await startCall(agentId);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleEndCall = () => {
    endCall();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you would mute the microphone stream
    toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleVolume = () => {
    const newVolume = volume > 0 ? 0 : 1;
    setVolume(newVolume);
    // In a real implementation, you would adjust the audio output volume
    toast.info(newVolume > 0 ? 'Audio enabled' : 'Audio muted');
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
      <CardHeader className="text-center pb-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-lg border-b-2 border-gray-300 dark:border-gray-600">
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

        {/* Transcript Display */}
        {showTranscript && callState.transcript && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Live Transcript</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm max-h-32 overflow-y-auto border-2 border-gray-300 dark:border-gray-600">
              <div className="text-gray-900 dark:text-white font-medium">
                {typeof callState.transcript === 'string' 
                  ? callState.transcript 
                  : JSON.stringify(callState.transcript)
                }
              </div>
            </div>
          </div>
        )}

        {/* Call Info */}
        {callState.callId && (
          <div className="text-center text-xs text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 p-3 rounded border-2 border-gray-300 dark:border-gray-600 font-semibold">
            <span className="font-bold">Call ID:</span> {callState.callId.slice(0, 8)}...
          </div>
        )}

        {/* Instructions */}
        {!isCallActive && (
          <div className="text-center text-sm text-blue-900 dark:text-blue-100 bg-blue-200 dark:bg-blue-800 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-600">
            <p className="font-bold text-blue-900 dark:text-blue-100">Click the phone button to start talking with {agentName}</p>
            <p className="text-xs mt-2 text-blue-800 dark:text-blue-200 font-semibold">Make sure your microphone is enabled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}