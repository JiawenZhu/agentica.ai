import { useState } from 'react';
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

const agentData = {
  id: 1,
  name: "Sarah - Real Estate Assistant",
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
  const [selectedVoice, setSelectedVoice] = useState(agentData.voiceProvider);
  const [selectedEmbed, setSelectedEmbed] = useState("inline");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useGPT4, setUseGPT4] = useState(true);
  const [enableMemory, setEnableMemory] = useState(true);
  const [conversation, setConversation] = useState([
    { role: "agent", text: "Hi! I'm Sarah, your real estate assistant. How can I help you today?" },
    { role: "user", text: "I'm looking for a 3-bedroom house in downtown." },
    { role: "agent", text: "Great! I can help you find 3-bedroom homes in the downtown area. What's your budget range, and are there any specific features you're looking for?" }
  ]);

  // Use agent ID from URL params or fall back to new properly configured agent
  const actualAgentId = agentIdFromUrl || 'agent_c4a397958805096bf70db2a610';

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
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
                  onClick={() => setIsPlaying(!isPlaying)}
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

              {/* Knowledge Upload */}
              <div className="space-y-2">
                <Label>Upload Knowledge Base</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop PDFs, text files, or paste URLs
                  </p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </div>

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