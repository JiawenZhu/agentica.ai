import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { KnowledgeBaseUpload } from '../KnowledgeBaseUpload';
import { KnowledgeBaseManager } from '../KnowledgeBaseManager';
import { RetellVoiceCall } from '../RetellVoiceCall';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Upload, 
  Copy, 
  Star, 
  Users, 
  Settings,
  Code,
  Globe,
  Mail,
  MousePointer,
  Layers,
  Check,
  Phone
} from 'lucide-react';

// Real agents data matching the marketplace
const agentsData = [
  {
    id: "agent_76ed44202b54308594db74ba81",
    name: "Bob - Customer Support Assistant",
    description: "Professional customer support agent with natural conversation flow and problem-solving capabilities",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tags: ["Customer Support", "Retell.ai", "GPT-4", "Problem Solving"],
    rating: 4.8,
    users: 1240,
    price: "Free",
    industry: "Customer Support",
    voiceProvider: "Retell.ai",
    category: "Customer Support",
    voice_id: "11labs-Brian"
  },
  {
    id: "agent_19b87dc8b8854e8fd507cd27d7",
    name: "Lisa - Sales Assistant",
    description: "Engaging sales assistant that helps qualify leads and schedule appointments with natural conversation",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=150&h=150&fit=crop&crop=face",
    tags: ["Sales", "Retell.ai", "Lead Qualification", "Scheduling"],
    rating: 4.9,
    users: 890,
    price: "Free",
    industry: "Sales",
    voiceProvider: "Retell.ai",
    category: "Sales Assistant",
    voice_id: "11labs-Chloe"
  },
  {
    id: "agent_10d32f961f65743f5d80af6ae2",
    name: "Software Engineer Interviewer",
    description: "Technical interviewer agent specialized in software engineering interviews with conversation flow",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    tags: ["HR", "Technical Interview", "Software Engineering", "Screening"],
    rating: 4.7,
    users: 650,
    price: "Free",
    industry: "Human Resources",
    voiceProvider: "Retell.ai",
    category: "HR",
    voice_id: "11labs-Andrew"
  },
  {
    id: "agent_5192fbebe055558b754f4ff116",
    name: "Interview Agent - Multilingual",
    description: "Multilingual interview agent supporting German and other languages for international hiring",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    tags: ["HR", "Multilingual", "Interview", "German"],
    rating: 4.6,
    users: 320,
    price: "Free",
    industry: "Human Resources",
    voiceProvider: "Retell.ai",
    category: "HR",
    voice_id: "11labs-Kate"
  },
  {
    id: "agent_12aeaeaf91ed0d746b4d83e55d",
    name: "Conversation Flow Agent",
    description: "Advanced conversation flow agent with structured dialogue patterns for complex interactions",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    tags: ["Conversation Flow", "Advanced", "Structured", "Complex"],
    rating: 4.8,
    users: 750,
    price: "Free",
    industry: "General",
    voiceProvider: "Retell.ai",
    category: "Advanced",
    voice_id: "11labs-Cimo"
  }
];

// Default agent data for fallback
const defaultAgentData = {
  id: "agent_76ed44202b54308594db74ba81",
  name: "Bob - Customer Support Assistant",
  description: "Helps visitors learn about properties and schedule viewings with natural conversation flow. Perfect for real estate websites looking to engage visitors 24/7.",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=150&h=150&fit=crop&crop=face",
  tags: ["Real Estate", "Retell.ai", "GPT-4", "Scheduling"],
  rating: 4.8,
  users: 1240,
  creator: "RealtyTech Solutions",
  voiceProvider: "Retell.ai - Professional Female Voice",
  personality: "Friendly, knowledgeable, and professional. Specializes in real estate terminology and can handle property inquiries, scheduling, and basic market information."
};

const voiceOptions = [
  "Retell.ai - Professional Female Voice",
  "Retell.ai - Casual Male Voice", 
  "Vogent.ai - Energetic Female Voice",
  "Vogent.ai - Authoritative Male Voice"
];

const embedOptions = [
  {
    id: "inline",
    title: "Inline Embed",
    description: "Embed directly into your page content",
    icon: <Layers className="w-5 h-5" />,
    code: `<div id="voice-agent-inline"></div>
<script src="https://cdn.voiceembed.com/widget.js"></script>
<script>
  VoiceEmbed.init({
    agentId: 'sarah-realestate-001',
    mode: 'inline',
    containerId: 'voice-agent-inline'
  });
</script>`
  },
  {
    id: "floating",
    title: "Floating Pop-Up",
    description: "Floating widget that appears on scroll or timer",
    icon: <MousePointer className="w-5 h-5" />,
    code: `<script src="https://cdn.voiceembed.com/widget.js"></script>
<script>
  VoiceEmbed.init({
    agentId: 'sarah-realestate-001',
    mode: 'floating',
    trigger: 'scroll', // or 'timer'
    position: 'bottom-right'
  });
</script>`
  },
  {
    id: "button",
    title: "Trigger via Button",
    description: "Custom button that opens voice chat modal",
    icon: <Globe className="w-5 h-5" />,
    code: `<button id="voice-chat-btn">Talk to Sarah</button>
<script src="https://cdn.voiceembed.com/widget.js"></script>
<script>
  VoiceEmbed.init({
    agentId: 'sarah-realestate-001',
    mode: 'modal',
    trigger: 'button',
    buttonId: 'voice-chat-btn'
  });
</script>`
  },
  {
    id: "email",
    title: "Email Snippet",
    description: "Add voice agent link to email signatures",
    icon: <Mail className="w-5 h-5" />,
    code: `<a href="https://voiceembed.com/chat/sarah-realestate-001" 
   target="_blank">
  🎙️ Talk to Sarah - Your AI Real Estate Assistant
</a>`
  }
];

export function AgentDetailPage() {
  const { id: agentIdFromUrl } = useParams<{ id: string }>();
  
  // Get agent data based on URL parameter
  const agentData = agentsData.find(agent => agent.id === agentIdFromUrl) || defaultAgentData;
  
  const [selectedVoice, setSelectedVoice] = useState(agentData.voiceProvider);
  const [selectedEmbed, setSelectedEmbed] = useState("inline");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useGPT4, setUseGPT4] = useState(true);
  const [enableMemory, setEnableMemory] = useState(true);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [conversation, setConversation] = useState([
    { role: "agent", text: `Hi! I'm ${agentData.name.split(' - ')[0]}, your AI assistant. How can I help you today?` },
    { role: "user", text: "I'd like to know more about your capabilities." },
    { role: "agent", text: `I'm designed to help with ${(agentData as any).category?.toLowerCase() || 'general'} tasks. I can assist you with various inquiries and provide helpful information. What would you like to know?` }
  ]);

  // Use the actual agent ID from the data
  const actualAgentId = agentData.id;

  // Load speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      };
      
      // Voices might not be loaded immediately
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Cleanup: stop any ongoing speech when component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handlePlayResponse = async () => {
    if (isPlaying) {
      // Stop current playback
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    try {
      // Get the last agent response from conversation
      const lastAgentResponse = conversation
        .filter(msg => msg.role === 'agent')
        .pop();

      if (!lastAgentResponse) {
        toast.error('No agent response to play');
        return;
      }

      setIsPlaying(true);
      
      // Use Web Speech API for TTS
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(lastAgentResponse.text);
        
        // Configure voice based on agent's voice_id
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        // Try to match the agent's voice characteristics
        if ((agentData as any).voice_id?.includes('Chloe') || (agentData as any).voice_id?.includes('Kate')) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('karen')
          );
        } else if ((agentData as any).voice_id?.includes('Brian') || (agentData as any).voice_id?.includes('Andrew')) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('daniel') ||
            voice.name.toLowerCase().includes('alex')
          );
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Configure speech parameters
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Handle speech events
        utterance.onstart = () => {
          toast.success(`Playing ${agentData.name.split(' - ')[0]}'s response`);
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          toast.error('Failed to play response');
        };
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
        
      } else {
        // Fallback: Create a simple audio notification
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
        
        setTimeout(() => setIsPlaying(false), 1000);
        toast.info('Text-to-speech not supported. Check console for response text.');
        console.log('Agent Response:', lastAgentResponse.text);
      }
      
    } catch (error) {
      console.error('Error playing response:', error);
      setIsPlaying(false);
      toast.error('Failed to play response');
    }
  };

  const selectedEmbedOption = embedOptions.find(option => option.id === selectedEmbed);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Agent Info & Demo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={agentData.avatar} alt={agentData.name} />
                  <AvatarFallback>{agentData.name.split(' ')[0][0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{agentData.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {agentData.rating}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {agentData.users.toLocaleString()} users
                    </div>
                  </div>
                  <CardDescription className="text-base mb-4">
                    {agentData.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {agentData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Demo Chat Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Demo
              </CardTitle>
              <CardDescription>
                Try talking to the agent or listen to the conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History */}
              <ScrollArea className="h-64 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Voice Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  className="rounded-full w-16 h-16"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePlayResponse}
                  disabled={conversation.filter(msg => msg.role === 'agent').length === 0}
                >
                  {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play Response'}
                </Button>
              </div>

              {isRecording && (
                <div className="text-center text-sm text-muted-foreground">
                  🎤 Listening... Speak now
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>Voice Provider & Style</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map(voice => (
                      <SelectItem key={voice} value={voice}>
                        {voice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Knowledge Base Management */}
              <Tabs defaultValue="upload" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Documents</TabsTrigger>
                  <TabsTrigger value="manage">Manage Knowledge Base</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <KnowledgeBaseUpload 
                    agentId={actualAgentId}
                    onUploadComplete={(document) => {
                      console.log('Document uploaded:', document);
                      toast.success('Knowledge base updated successfully!');
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="manage">
                  <KnowledgeBaseManager agentId={actualAgentId} />
                </TabsContent>
              </Tabs>

              {/* Agent Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Use GPT-4</Label>
                    <p className="text-xs text-muted-foreground">
                      Higher quality responses (additional cost)
                    </p>
                  </div>
                  <Switch checked={useGPT4} onCheckedChange={setUseGPT4} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Personality Memory</Label>
                    <p className="text-xs text-muted-foreground">
                      Remember context across conversations
                    </p>
                  </div>
                  <Switch checked={enableMemory} onCheckedChange={setEnableMemory} />
                </div>
              </div>

              {/* Custom Personality */}
              <div className="space-y-2">
                <Label>Custom Instructions (Optional)</Label>
                <Textarea 
                  placeholder="Add specific instructions for how the agent should behave..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Voice Call, Embed Options & Pricing */}
        <div className="space-y-6">
          {/* Voice Call Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Test Voice Call
              </CardTitle>
              <CardDescription>
                Try a live voice conversation with this agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RetellVoiceCall
                agentId={actualAgentId}
                agentName={agentData.name}
                showTranscript={true}
              />
            </CardContent>
          </Card>

          {/* Embed Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Embed Options
              </CardTitle>
              <CardDescription>
                Choose how to add this agent to your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedEmbed} onValueChange={setSelectedEmbed}>
                <TabsList className="grid grid-cols-2 gap-1 mb-4">
                  {embedOptions.map(option => (
                    <TabsTrigger 
                      key={option.id} 
                      value={option.id}
                      className="text-xs p-2"
                    >
                      {option.icon}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {embedOptions.map(option => (
                  <TabsContent key={option.id} value={option.id} className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        {option.icon}
                      </div>
                      <h4>{option.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Embed Code</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(option.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <ScrollArea className="h-32">
                        <pre className="text-xs bg-muted p-3 rounded border overflow-x-auto">
                          <code>{option.code}</code>
                        </pre>
                      </ScrollArea>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => toast.success('Opening preview...')}
                    >
                      Live Preview
                    </Button>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Activation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl">Free</div>
                <p className="text-sm text-muted-foreground">
                  Up to 100 conversations/month
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Voice minutes included</span>
                  <span>500 mins</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Knowledge base upload</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Custom branding</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Analytics dashboard</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              </div>

              <Button className="w-full" size="lg">
                Start for Free
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                No credit card required. Upgrade anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}