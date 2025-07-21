import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { EnhancedSearch } from '../EnhancedSearch';
import { EnhancedAgentCard } from '../EnhancedAgentCard';
import { Search, Play, Star, Users, Filter, Grid, List, Heart, Share2, TrendingUp, Eye, Bookmark } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';

// Real agents from your Retell account with enhanced marketplace data
const agents = [
  {
    id: "agent_76ed44202b54308594db74ba81", // Bob - Latest
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
    id: "agent_19b87dc8b8854e8fd507cd27d7", // Lisa - Latest
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
    id: "agent_10d32f961f65743f5d80af6ae2", // Software Engineer Interviewer
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
    id: "agent_5192fbebe055558b754f4ff116", // Interview agent (German)
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
    id: "agent_12aeaeaf91ed0d746b4d83e55d", // Conversation Flow Agent
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
  },
  {
    id: "agent_54ac582260271a682e942a2dbc", // Bob - Alternative
    name: "Bob - General Assistant",
    description: "Versatile general-purpose assistant for various business needs and customer interactions",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tags: ["General", "Versatile", "Business", "Assistant"],
    rating: 4.5,
    users: 420,
    price: "Free",
    industry: "General",
    voiceProvider: "Retell.ai",
    category: "General Assistant",
    voice_id: "11labs-Brian"
  },
  {
    id: "agent_30ea5584adfc13ddc9c6e209cf", // Lisa - Alternative
    name: "Lisa - Business Assistant",
    description: "Professional business assistant for handling inquiries and providing information",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=150&h=150&fit=crop&crop=face",
    tags: ["Business", "Professional", "Inquiries", "Information"],
    rating: 4.4,
    users: 580,
    price: "Free",
    industry: "Business",
    voiceProvider: "Retell.ai",
    category: "Business Assistant",
    voice_id: "11labs-Chloe"
  }
];

const industries = ["All Industries", "Customer Support", "Sales", "Human Resources", "General", "Business", "Advanced"];
const voiceProviders = ["All Providers", "Retell.ai", "Vogent.ai"];
const pricing = ["All Pricing", "Free", "Paid"];

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, actions } = useApp();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState("All Providers");
  const [selectedPricing, setSelectedPricing] = useState("All Pricing");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popularity");

  // Handle URL parameters
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (category) {
      // Map category to industry if it matches
      const industryMap: { [key: string]: string } = {
        'Customer Support': 'Customer Support',
        'Sales Assistant': 'Sales',
        'Lead Generation': 'Sales',
        'Real Estate': 'Real Estate',
        'Healthcare Assistant': 'Healthcare',
        'Appointment Booking': 'Healthcare'
      };
      
      const mappedIndustry = industryMap[category];
      if (mappedIndustry && industries.includes(mappedIndustry)) {
        setSelectedIndustry(mappedIndustry);
      }
    }
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const searchTerm = suggestion.text;
    setSearchQuery(searchTerm);
    
    // Handle different suggestion types
    if (suggestion.type === 'industry') {
      // If it's an industry suggestion, also set the industry filter
      if (industries.includes(searchTerm)) {
        setSelectedIndustry(searchTerm);
      }
    } else if (suggestion.type === 'voice') {
      // If it's a voice provider suggestion, set the voice provider filter
      if (voiceProviders.includes(searchTerm)) {
        setSelectedVoiceProvider(searchTerm);
      }
    }
    
    handleSearch(searchTerm);
  };

  const filteredAgents = agents.filter(agent => {
    // Enhanced search logic - matches multiple fields
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.tags.some(tag => tag.toLowerCase().includes(query)) ||
      agent.industry.toLowerCase().includes(query) ||
      agent.voiceProvider.toLowerCase().includes(query) ||
      agent.category.toLowerCase().includes(query);
      
    const matchesIndustry = selectedIndustry === "All Industries" || agent.industry === selectedIndustry;
    const matchesVoiceProvider = selectedVoiceProvider === "All Providers" || agent.voiceProvider === selectedVoiceProvider;
    const matchesPricing = selectedPricing === "All Pricing" || 
                          (selectedPricing === "Free" && agent.price === "Free") ||
                          (selectedPricing === "Paid" && agent.price !== "Free");
    
    return matchesSearch && matchesIndustry && matchesVoiceProvider && matchesPricing;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        if (a.price === "Free" && b.price !== "Free") return -1;
        if (a.price !== "Free" && b.price === "Free") return 1;
        return 0;
      case 'newest':
        return String(b.id).localeCompare(String(a.id));
      case 'popularity':
      default:
        return b.users - a.users;
    }
  });

  const toggleFavorite = (agentId: string | number) => {
    actions.toggleFavorite(agentId);
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      const isFav = state.favoriteAgents.includes(agentId);
      toast.success(
        isFav ? `Removed ${agent.name} from favorites` : `Added ${agent.name} to favorites`,
        {
          action: {
            label: isFav ? "Undo" : "View Favorites",
            onClick: () => isFav ? actions.toggleFavorite(agentId) : window.location.href = '/dashboard'
          }
        }
      );
    }
  };

  const handleShare = (agent: any) => {
    if (navigator.share) {
      navigator.share({
        title: agent.name,
        text: agent.description,
        url: window.location.origin + `/agent/${agent.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/agent/${agent.id}`);
      toast.success("Agent link copied to clipboard!");
    }
  };

  const isFavorite = (agentId: string | number) => {
    return state.favoriteAgents.includes(agentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 via-blue-600/5 to-purple-600/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
              AI Agent Marketplace
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and deploy pre-built voice agents for your website. Over 500+ agents ready to use.
            </p>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-3xl mx-auto">
            <EnhancedSearch
              placeholder="Search for agents, industries, or capabilities..."
              onSearch={handleSearch}
              onSuggestionSelect={handleSuggestionSelect}
              size="default"
              showQuickActions={false}
              showSuggestions={true}
              initialValue={searchQuery}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Search */}
                <div className="space-y-2">
                  <Label>Search Agents</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by name or description..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Industry Filter */}
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Voice Provider Filter */}
                <div className="space-y-2">
                  <Label>Voice Provider</Label>
                  <Select value={selectedVoiceProvider} onValueChange={setSelectedVoiceProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing Filter */}
                <div className="space-y-2">
                  <Label>Pricing</Label>
                  <Select value={selectedPricing} onValueChange={setSelectedPricing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pricing.map(price => (
                        <SelectItem key={price} value={price}>
                          {price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Embeddability Type */}
                <div className="space-y-3">
                  <Label>Embeddability Type</Label>
                  <div className="space-y-2">
                    {["Inline Embed", "Floating Pop-Up", "Trigger Button", "Email Snippet"].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={type} defaultChecked />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-lg font-medium mb-1">
                  {sortedAgents.length} agents found
                </div>
                {searchQuery && (
                  <div className="text-sm text-muted-foreground">
                    Results for "{searchQuery}"
                    {selectedIndustry !== "All Industries" && (
                      <span className="ml-2">in {selectedIndustry}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Popularity
                        </div>
                      </SelectItem>
                      <SelectItem value="rating">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Rating
                        </div>
                      </SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Agent Grid/List */}
            {sortedAgents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndustry('All Industries');
                      setSelectedVoiceProvider('All Providers');
                      setSelectedPricing('All Pricing');
                      // Clear URL params as well
                      const newParams = new URLSearchParams();
                      setSearchParams(newParams);
                    }}
                  >
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {sortedAgents.map((agent) => (
                  <EnhancedAgentCard
                    key={agent.id}
                    agent={agent}
                    variant={viewMode}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}