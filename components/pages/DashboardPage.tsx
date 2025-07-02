import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { RetellAgentManager } from '../RetellAgentManager';
import { VogentAgentManager } from '../VogentAgentManager';
import { 
  Copy,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  Code,
  Globe,
  MousePointer,
  Mail,
  Eye,
  Plus,
  Bot
} from 'lucide-react';

const userAgents = [
  {
    id: 1,
    name: "Sarah - Real Estate Assistant",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=150&h=150&fit=crop&crop=face",
    status: "live",
    voiceProvider: "Retell.ai",
    conversations: 156,
    minutes: 420,
    rating: 4.8,
    deployed: "3 sites",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Alex - Support Pro",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "paused",
    voiceProvider: "Vogent.ai",
    conversations: 89,
    minutes: 240,
    rating: 4.9,
    deployed: "1 site",
    lastActive: "1 day ago"
  }
];

const embedTypes = [
  { id: "inline", name: "Inline Embed", icon: <Globe className="w-4 h-4" /> },
  { id: "floating", name: "Floating Pop-Up", icon: <MousePointer className="w-4 h-4" /> },
  { id: "button", name: "Trigger Button", icon: <Play className="w-4 h-4" /> },
  { id: "email", name: "Email Snippet", icon: <Mail className="w-4 h-4" /> }
];

const embedCodes = {
  inline: `<div id="voice-agent-inline"></div>
<script src="https://cdn.voiceembed.com/widget.js"></script>
<script>
  VoiceEmbed.init({
    agentId: 'your-agent-id',
    mode: 'inline',
    containerId: 'voice-agent-inline'
  });
</script>`,
  floating: `<script src="https://cdn.voiceembed.com/widget.js"></script>
<script>
  VoiceEmbed.init({
    agentId: 'your-agent-id',
    mode: 'floating',
    trigger: 'scroll',
    position: 'bottom-right'
  });
</script>`,
  button: `<button id="voice-chat-btn">Talk to Agent</button>
<script src="https://cdn.voiceembed.com/widget.js"></script>
<script>
  VoiceEmbed.init({
    agentId: 'your-agent-id',
    mode: 'modal',
    trigger: 'button',
    buttonId: 'voice-chat-btn'
  });
</script>`,
  email: `<a href="https://voiceembed.com/chat/your-agent-id" target="_blank">
  🎙️ Talk to our AI Assistant
</a>`
};

export function DashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState("1");
  const [selectedEmbedType, setSelectedEmbedType] = useState("inline");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const selectedAgentData = userAgents.find(agent => agent.id.toString() === selectedAgent);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your voice agents and view performance</p>
          </div>
          <Button asChild>
            <Link to="/marketplace">
              <Plus className="w-4 h-4 mr-2" />
              Add New Agent
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">My Agents</TabsTrigger>
          <TabsTrigger value="retell">
            <Bot className="w-4 h-4 mr-2" />
            Retell Agents
          </TabsTrigger>
          <TabsTrigger value="vogent">
            <Bot className="w-4 h-4 mr-2" />
            Vogent Agents
          </TabsTrigger>
          <TabsTrigger value="embed">Embed Code</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* My Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6">
            {userAgents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>{agent.name.split(' ')[0][0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {agent.name}
                          <Badge variant={agent.status === "live" ? "default" : "secondary"}>
                            {agent.status === "live" ? "Live" : "Paused"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {agent.voiceProvider} • Deployed on {agent.deployed} • Last active {agent.lastActive}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl">{agent.conversations}</div>
                      <p className="text-sm text-muted-foreground">Conversations</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">{agent.minutes}m</div>
                      <p className="text-sm text-muted-foreground">Voice Minutes</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">⭐ {agent.rating}</div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">{agent.deployed}</div>
                      <p className="text-sm text-muted-foreground">Deployments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Retell Agents Tab */}
        <TabsContent value="retell" className="space-y-6">
          <RetellAgentManager />
        </TabsContent>

        {/* Vogent Agents Tab */}
        <TabsContent value="vogent" className="space-y-6">
          <VogentAgentManager />
        </TabsContent>

        {/* Embed Code Tab */}
        <TabsContent value="embed" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Embed Code Generator
                  </CardTitle>
                  <CardDescription>
                    Generate embed code for your selected agent and integration type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Agent Selection */}
                  <div className="space-y-2">
                    <Label>Select Agent</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={agent.avatar} />
                                <AvatarFallback className="text-xs">
                                  {agent.name.split(' ')[0][0]}
                                </AvatarFallback>
                              </Avatar>
                              {agent.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Embed Type Selection */}
                  <div className="space-y-2">
                    <Label>Embed Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {embedTypes.map(type => (
                        <Button
                          key={type.id}
                          variant={selectedEmbedType === type.id ? "default" : "outline"}
                          className="justify-start h-auto p-3"
                          onClick={() => setSelectedEmbedType(type.id)}
                        >
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <span className="text-sm">{type.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Generated Code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Generated Code</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(embedCodes[selectedEmbedType as keyof typeof embedCodes])}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-48">
                      <pre className="text-xs bg-muted p-4 rounded border overflow-x-auto">
                        <code>{embedCodes[selectedEmbedType as keyof typeof embedCodes]}</code>
                      </pre>
                    </ScrollArea>
                  </div>

                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Integration
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Agent Preview Card */}
            <div>
              {selectedAgentData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agent Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={selectedAgentData.avatar} />
                        <AvatarFallback>
                          {selectedAgentData.name.split(' ')[0][0]}
                        </AvatarFallback>
                      </Avatar>
                      <h4>{selectedAgentData.name}</h4>
                      <Badge variant={selectedAgentData.status === "live" ? "default" : "secondary"}>
                        {selectedAgentData.status}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voice Provider</span>
                        <span>{selectedAgentData.voiceProvider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversations</span>
                        <span>{selectedAgentData.conversations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating</span>
                        <span>⭐ {selectedAgentData.rating}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Test Voice
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">245</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Voice Minutes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">660m</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Avg Rating</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">4.85</div>
                <p className="text-xs text-muted-foreground">
                  +0.2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">1,840</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +15% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Agent Performance */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Usage breakdown by agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userAgents.map((agent) => (
                  <div key={agent.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="text-xs">
                            {agent.name.split(' ')[0][0]}
                          </AvatarFallback>
                        </Avatar>
                        {agent.name}
                      </div>
                      <span>{agent.conversations} conversations</span>
                    </div>
                    <Progress 
                      value={(agent.conversations / 245) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
                <CardDescription>Current plan limits and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conversations (Free Plan)</span>
                    <span>245 / 1,000</span>
                  </div>
                  <Progress value={24.5} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voice Minutes</span>
                    <span>660 / 2,000</span>
                  </div>
                  <Progress value={33} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Knowledge Uploads</span>
                    <span>5 / 10</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>

                <Separator />

                <Button variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}