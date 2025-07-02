import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { 
  Upload, 
  User, 
  Mic, 
  FileText, 
  Settings, 
  DollarSign, 
  Globe,
  Save,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';

const steps = [
  { id: 1, title: "Basic Info", icon: <User className="w-4 h-4" /> },
  { id: 2, title: "Avatar & Voice", icon: <Mic className="w-4 h-4" /> },
  { id: 3, title: "Knowledge Base", icon: <FileText className="w-4 h-4" /> },
  { id: 4, title: "Personality", icon: <Settings className="w-4 h-4" /> },
  { id: 5, title: "Embed Settings", icon: <Globe className="w-4 h-4" /> },
  { id: 6, title: "Pricing", icon: <DollarSign className="w-4 h-4" /> }
];

const voiceOptions = [
  { id: "retell-female-1", name: "Retell.ai - Professional Female", preview: "preview1.mp3" },
  { id: "retell-male-1", name: "Retell.ai - Casual Male", preview: "preview2.mp3" },
  { id: "vogent-female-1", name: "Vogent.ai - Energetic Female", preview: "preview3.mp3" },
  { id: "vogent-male-1", name: "Vogent.ai - Authoritative Male", preview: "preview4.mp3" }
];

const industries = [
  "Real Estate", "Customer Support", "Sales", "Finance", "Healthcare", 
  "Education", "E-commerce", "Legal", "HR", "Marketing", "Other"
];

const avatarOptions = [
  "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
];

export function CreateAgentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: "",
    description: "", 
    industry: "",
    avatar: "",
    customAvatar: null as File | null,
    voice: "",
    knowledgeFiles: [] as File[],
    knowledgeUrls: "",
    personality: "",
    systemPrompt: "",
    enableMemory: true,
    useGPT4: false,
    embedTypes: {
      inline: true,
      floating: true,
      button: true,
      email: true
    },
    pricing: "free",
    monthlyPrice: 0,
    publishToMarketplace: false
  });

  const updateAgentData = useCallback((field: string, value: any) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = () => {
    toast.success('Agent published successfully!');
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Create Your Own Agent</h1>
          <p className="text-muted-foreground">Build a custom voice agent tailored to your needs</p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">Step {currentStep} of {steps.length}</span>
              <span className="text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.id < currentStep 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : step.id === currentStep
                      ? 'border-primary'
                      : 'border-muted'
                  }`}>
                    {step.id < currentStep ? <Check className="w-4 h-4" /> : step.icon}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Basic Information</h2>
                  <p className="text-muted-foreground">Tell us about your agent</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name *</Label>
                    <Input 
                      id="name"
                      key="agent-name-input"
                      placeholder="e.g., Sarah - Customer Support Assistant"
                      value={agentData.name}
                      onChange={(e) => updateAgentData('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={agentData.industry} onValueChange={(value) => updateAgentData('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description"
                    placeholder="Describe what your agent does and how it helps users..."
                    rows={3}
                    value={agentData.description}
                    onChange={(e) => updateAgentData('description', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Avatar & Voice */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Avatar & Voice</h2>
                  <p className="text-muted-foreground">Choose how your agent looks and sounds</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Avatar</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {avatarOptions.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => updateAgentData('avatar', avatar)}
                          className={`relative rounded-full overflow-hidden border-4 transition-colors ${
                            agentData.avatar === avatar ? 'border-primary' : 'border-transparent hover:border-muted'
                          }`}
                        >
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>A{index + 1}</AvatarFallback>
                          </Avatar>
                          {agentData.avatar === avatar && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Or upload custom:</span>
                      <Input 
                        type="file" 
                        accept="image/*"
                        className="w-auto"
                        onChange={(e) => updateAgentData('customAvatar', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Voice Provider & Style</Label>
                    <div className="space-y-3">
                      {voiceOptions.map((voice) => (
                        <div 
                          key={voice.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            agentData.voice === voice.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'
                          }`}
                          onClick={() => updateAgentData('voice', voice.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                agentData.voice === voice.id ? 'border-primary bg-primary' : 'border-muted'
                              }`}>
                                {agentData.voice === voice.id && (
                                  <div className="w-full h-full rounded-full bg-primary"></div>
                                )}
                              </div>
                              <span>{voice.name}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Knowledge Base */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Knowledge Base</h2>
                  <p className="text-muted-foreground">Upload files and URLs to train your agent</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Upload Files</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg mb-2">Drag & drop files here</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supported: PDF, DOCX, TXT, CSV (Max 10MB each)
                      </p>
                      <Button variant="outline">
                        Choose Files
                      </Button>
                    </div>
                    
                    {agentData.knowledgeFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Files</Label>
                        <div className="space-y-2">
                          {agentData.knowledgeFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urls">Website URLs (Optional)</Label>
                    <Textarea 
                      id="urls"
                      placeholder="Enter URLs, one per line:&#10;https://example.com/faq&#10;https://example.com/about"
                      rows={4}
                      value={agentData.knowledgeUrls}
                      onChange={(e) => updateAgentData('knowledgeUrls', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll crawl these pages and extract the content for training
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Personality */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Agent Personality</h2>
                  <p className="text-muted-foreground">Define how your agent behaves and responds</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality Description</Label>
                    <Textarea 
                      id="personality"
                      placeholder="e.g., Friendly and professional, specializes in real estate. Uses a consultative approach and asks follow-up questions to better understand customer needs..."
                      rows={3}
                      value={agentData.personality}
                      onChange={(e) => updateAgentData('personality', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Instructions (Advanced)</Label>
                    <Textarea 
                      id="systemPrompt"
                      placeholder="Specific instructions for how the agent should behave, handle edge cases, or format responses..."
                      rows={4}
                      value={agentData.systemPrompt}
                      onChange={(e) => updateAgentData('systemPrompt', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Advanced users can provide specific system-level instructions
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Agent Capabilities</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Enable Conversation Memory</Label>
                          <p className="text-xs text-muted-foreground">
                            Remember context across multiple conversations with the same user
                          </p>
                        </div>
                        <Switch 
                          checked={agentData.enableMemory} 
                          onCheckedChange={(checked) => updateAgentData('enableMemory', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Use GPT-4 (Premium)</Label>
                          <p className="text-xs text-muted-foreground">
                            Higher quality responses with better reasoning (additional cost)
                          </p>
                        </div>
                        <Switch 
                          checked={agentData.useGPT4} 
                          onCheckedChange={(checked) => updateAgentData('useGPT4', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Embed Settings */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Embed Configuration</h2>
                  <p className="text-muted-foreground">Choose which embed types to support</p>
                </div>

                <div className="space-y-4">
                  <Label>Available Embed Types</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: 'inline', title: 'Inline Embed', desc: 'Embed directly in page content' },
                      { key: 'floating', title: 'Floating Pop-Up', desc: 'Floating widget on scroll/timer' },
                      { key: 'button', title: 'Trigger Button', desc: 'Custom button opens modal' },
                      { key: 'email', title: 'Email Snippet', desc: 'Link for email signatures' }
                    ].map((embed) => (
                      <div key={embed.key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4>{embed.title}</h4>
                          <Switch 
                            checked={agentData.embedTypes[embed.key as keyof typeof agentData.embedTypes]} 
                            onCheckedChange={(checked) => 
                              updateAgentData('embedTypes', {
                                ...agentData.embedTypes,
                                [embed.key]: checked
                              })
                            }
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{embed.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Pricing */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl mb-2">Pricing & Publishing</h2>
                  <p className="text-muted-foreground">Set your pricing and publish to marketplace</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label>Pricing Model</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          agentData.pricing === 'free' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'
                        }`}
                        onClick={() => updateAgentData('pricing', 'free')}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            agentData.pricing === 'free' ? 'border-primary bg-primary' : 'border-muted'
                          }`}></div>
                          <h4>Free</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Make your agent available for free to build reputation
                        </p>
                      </div>

                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          agentData.pricing === 'paid' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'
                        }`}
                        onClick={() => updateAgentData('pricing', 'paid')}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            agentData.pricing === 'paid' ? 'border-primary bg-primary' : 'border-muted'
                          }`}></div>
                          <h4>Paid</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Charge a monthly subscription for your agent
                        </p>
                      </div>
                    </div>

                    {agentData.pricing === 'paid' && (
                      <div className="space-y-2">
                        <Label htmlFor="monthlyPrice">Monthly Price (USD)</Label>
                        <div className="flex items-center gap-2">
                          <span>$</span>
                          <Input 
                            id="monthlyPrice"
                            type="number"
                            min="1"
                            max="999"
                            value={agentData.monthlyPrice}
                            onChange={(e) => updateAgentData('monthlyPrice', parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">per month</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Publish to Marketplace</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your agent discoverable by other users
                      </p>
                    </div>
                    <Switch 
                      checked={agentData.publishToMarketplace} 
                      onCheckedChange={(checked) => updateAgentData('publishToMarketplace', checked)}
                    />
                  </div>

                  {agentData.publishToMarketplace && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Marketplace Guidelines</h4>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Agent will be reviewed before going live</li>
                            <li>• Must comply with content and quality standards</li>
                            <li>• We take a 10% platform fee on paid agents</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            {currentStep === steps.length ? (
              <Button onClick={handlePublish}>
                Publish Agent
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}