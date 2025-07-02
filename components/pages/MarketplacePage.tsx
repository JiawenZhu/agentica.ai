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

const agents = [
  {
    id: 1,
    name: "Sarah - Real Estate Assistant",
    description: "Helps visitors learn about properties and schedule viewings with natural conversation flow",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=150&h=150&fit=crop&crop=face",
    tags: ["Real Estate", "Retell.ai", "GPT-4", "Scheduling"],
    rating: 4.8,
    users: 1240,
    price: "Free",
    industry: "Real Estate",
    voiceProvider: "Retell.ai",
    category: "Real Estate"
  },
  {
    id: 2,
    name: "Alex - Customer Support Pro",
    description: "Handles common support questions with knowledge base integration and escalation",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tags: ["Support", "Vogent.ai", "Claude", "Knowledge Base"],
    rating: 4.9,
    users: 890,
    price: "$29/month",
    industry: "Customer Support",
    voiceProvider: "Vogent.ai",
    category: "Customer Support"
  },
  {
    id: 3,
    name: "Maya - Product Demo Guide",
    description: "Interactive product demos and feature explanations with screen sharing capabilities",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    tags: ["Sales", "Onboarding", "GPT-4", "Demo"],
    rating: 4.7,
    users: 650,
    price: "$49/month",
    industry: "Sales",
    voiceProvider: "Retell.ai",
    category: "Sales Assistant"
  },
  {
    id: 4,
    name: "David - Finance Advisor",
    description: "Financial planning conversations and budget guidance with calculation tools",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    tags: ["Finance", "Retell.ai", "Expert", "Calculator"],
    rating: 4.8,
    users: 420,
    price: "$79/month",
    industry: "Finance",
    voiceProvider: "Retell.ai",
    category: "Finance"
  },
  {
    id: 5,
    name: "Emma - HR Recruiter",
    description: "Initial candidate screening and interview scheduling with evaluation criteria",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    tags: ["HR", "Vogent.ai", "Screening", "Scheduling"],
    rating: 4.6,
    users: 320,
    price: "$39/month",
    industry: "Human Resources",
    voiceProvider: "Vogent.ai",
    category: "HR"
  },
  {
    id: 6,
    name: "Carlos - Language Tutor",
    description: "Interactive language learning with pronunciation feedback and conversation practice",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    tags: ["Education", "Language", "GPT-4", "Practice"],
    rating: 4.9,
    users: 750,
    price: "Free",
    industry: "Education",
    voiceProvider: "Retell.ai",
    category: "Education"
  },
  {
    id: 7,
    name: "Lisa - Lead Generation Expert",
    description: "Qualifies leads automatically and schedules follow-up calls with sales team",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    tags: ["Lead Gen", "Retell.ai", "Qualification", "CRM"],
    rating: 4.7,
    users: 580,
    price: "$59/month",
    industry: "Sales",
    voiceProvider: "Retell.ai",
    category: "Lead Generation"
  },
  {
    id: 8,
    name: "Dr. Amy - Health Assistant",
    description: "Provides health information and appointment scheduling for medical practices",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    tags: ["Healthcare", "Vogent.ai", "HIPAA", "Scheduling"],
    rating: 4.8,
    users: 340,
    price: "$89/month",
    industry: "Healthcare",
    voiceProvider: "Vogent.ai",
    category: "Healthcare"
  }
];

const industries = ["All Industries", "Real Estate", "Customer Support", "Sales", "Finance", "Human Resources", "Education", "Healthcare"];
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
        return b.id - a.id;
      case 'popularity':
      default:
        return b.users - a.users;
    }
  });

  const toggleFavorite = (agentId: number) => {
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

  const isFavorite = (agentId: number) => {
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