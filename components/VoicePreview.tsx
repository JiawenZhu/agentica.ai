import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VoicePreviewProps {
  voiceId: string;
  voiceName: string;
  sampleText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Mock voice samples - in a real app, these would be actual audio URLs
const voiceSamples: Record<string, string> = {
  'retell-female-1': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'retell-male-1': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'vogent-female-1': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'vogent-male-1': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
};

export function VoicePreview({ 
  voiceId, 
  voiceName, 
  sampleText = "Hello! I'm your AI assistant. How can I help you today?",
  className = "",
  size = 'md' 
}: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would generate audio from text using TTS API
      // For demo purposes, we'll simulate this
      const audioUrl = voiceSamples[voiceId];
      
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current?.duration || 0);
        });
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      } else {
        // Simulate TTS generation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo, we'll just show a simulated playback
        setIsPlaying(true);
        setProgress(0);
        
        // Simulate audio playback with progress
        const totalDuration = 3000; // 3 seconds
        const interval = 100; // Update every 100ms
        let currentTime = 0;
        
        progressInterval.current = setInterval(() => {
          currentTime += interval;
          const progressPercent = (currentTime / totalDuration) * 100;
          setProgress(progressPercent);
          
          if (currentTime >= totalDuration) {
            setIsPlaying(false);
            setProgress(0);
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }
        }, interval);
        
        toast.success(`Playing ${voiceName} voice sample`);
      }
    } catch (error) {
      toast.error('Failed to play voice sample');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size={buttonSize}
        onClick={handlePlay}
        disabled={isLoading}
        className="min-w-0"
      >
        {isLoading ? (
          <div className={`animate-spin rounded-full border-2 border-muted-foreground border-t-primary ${iconSize}`} />
        ) : isPlaying ? (
          <Pause className={iconSize} />
        ) : (
          <Play className={iconSize} />
        )}
        {size !== 'sm' && (
          <span className="ml-2">
            {isLoading ? 'Generating...' : isPlaying ? 'Playing' : 'Preview'}
          </span>
        )}
      </Button>
      
      {isPlaying && size !== 'sm' && (
        <>
          <div className="flex-1 min-w-20">
            <Progress value={progress} className="h-1" />
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleMute}
            className="min-w-0 px-2"
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </Button>
        </>
      )}
    </div>
  );
}

// Voice Recording Component
interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  maxDuration?: number;
  className?: string;
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  maxDuration = 30000, // 30 seconds
  className = "" 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      const chunks: BlobPart[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        onRecordingComplete?.(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1000;
        });
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className="rounded-full w-16 h-16"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <div className="w-4 h-4 bg-white rounded-sm" />
        ) : (
          <div className="w-6 h-6 bg-white rounded-full" />
        )}
      </Button>
      
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
          <Progress 
            value={(recordingTime / maxDuration) * 100} 
            className="w-32 h-2"
          />
        </div>
      )}
    </div>
  );
}