import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Bot, Mic, Briefcase, Users, ShoppingCart, Heart, Clock, TrendingUp, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { useDebounce } from '../hooks/useDebounce';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'agent' | 'category' | 'feature' | 'industry' | 'voice';
  icon?: React.ReactNode;
  popular?: boolean;
  description?: string;
  agentCount?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  onClick: () => void;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  size?: 'default' | 'large';
  showQuickActions?: boolean;
  showSuggestions?: boolean;
  className?: string;
  initialValue?: string;
}

// Enhanced suggestions with more comprehensive data
const mockSuggestions: SearchSuggestion[] = [
  // Popular Agents
  { 
    id: '1', 
    text: 'Customer Support Agent', 
    type: 'agent', 
    icon: <Users className="w-4 h-4" />, 
    popular: true,
    description: 'Handle customer inquiries and support tickets',
    agentCount: 12 
  },
  { 
    id: '2', 
    text: 'Sales Assistant', 
    type: 'agent', 
    icon: <ShoppingCart className="w-4 h-4" />, 
    popular: true,
    description: 'Lead qualification and sales support',
    agentCount: 8 
  },
  { 
    id: '3', 
    text: 'Real Estate Agent', 
    type: 'agent', 
    icon: <Briefcase className="w-4 h-4" />, 
    popular: true,
    description: 'Property inquiries and scheduling',
    agentCount: 5 
  },
  { 
    id: '4', 
    text: 'Healthcare Assistant', 
    type: 'agent', 
    icon: <Heart className="w-4 h-4" />,
    description: 'Medical appointment scheduling and health info',
    agentCount: 6 
  },

  // Industries
  { 
    id: '5', 
    text: 'Real Estate', 
    type: 'industry', 
    icon: <Briefcase className="w-4 h-4" />,
    description: 'Property management and sales agents',
    agentCount: 15 
  },
  { 
    id: '6', 
    text: 'Healthcare', 
    type: 'industry', 
    icon: <Heart className="w-4 h-4" />,
    description: 'Medical and health-related agents',
    agentCount: 8 
  },
  { 
    id: '7', 
    text: 'Finance', 
    type: 'industry', 
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Financial advice and planning agents',
    agentCount: 4 
  },
  { 
    id: '8', 
    text: 'Education', 
    type: 'industry', 
    icon: <Users className="w-4 h-4" />,
    description: 'Educational and tutoring agents',
    agentCount: 6 
  },

  // Features
  { 
    id: '9', 
    text: 'Appointment Booking', 
    type: 'feature', 
    icon: <Clock className="w-4 h-4" />,
    description: 'Schedule and manage appointments',
    agentCount: 10 
  },
  { 
    id: '10', 
    text: 'Lead Generation', 
    type: 'feature', 
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Qualify and capture leads automatically',
    agentCount: 7 
  },
  { 
    id: '11', 
    text: 'Voice Recording', 
    type: 'feature', 
    icon: <Mic className="w-4 h-4" />,
    description: 'Record and transcribe conversations',
    agentCount: 12 
  },

  // Voice Providers
  { 
    id: '12', 
    text: 'Retell.ai', 
    type: 'voice', 
    icon: <Mic className="w-4 h-4" />,
    description: 'Professional AI voice provider',
    agentCount: 18 
  },
  { 
    id: '13', 
    text: 'Vogent.ai', 
    type: 'voice', 
    icon: <Mic className="w-4 h-4" />,
    description: 'Advanced voice AI platform',
    agentCount: 14 
  },

  // Categories
  { 
    id: '14', 
    text: 'E-commerce Helper', 
    type: 'category', 
    icon: <ShoppingCart className="w-4 h-4" />,
    description: 'Shopping assistance and product support',
    agentCount: 9 
  },
  { 
    id: '15', 
    text: 'HR Recruiting', 
    type: 'category', 
    icon: <Users className="w-4 h-4" />,
    description: 'Candidate screening and recruitment',
    agentCount: 5 
  }
];

const quickActions: QuickAction[] = [
  {
    id: 'browse-agents',
    label: 'Browse All Agents',
    icon: <Bot className="w-4 h-4" />,
    description: 'Explore our marketplace',
    onClick: () => window.location.href = '/marketplace'
  },
  {
    id: 'create-agent',
    label: 'Create Custom Agent',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Build your own AI agent',
    onClick: () => window.location.href = '/create'
  },
  {
    id: 'popular-voice',
    label: 'Popular Voice Agents',
    icon: <Mic className="w-4 h-4" />,
    description: 'Most used voice agents',
    onClick: () => window.location.href = '/marketplace?sort=popularity'
  },
  {
    id: 'business-solutions',
    label: 'Business Solutions',
    icon: <Briefcase className="w-4 h-4" />,
    description: 'Enterprise-ready agents',
    onClick: () => window.location.href = '/marketplace?category=business'
  }
];

export function EnhancedSearch({
  placeholder = "Search for AI agents, features, or use cases...",
  onSearch,
  onSuggestionSelect,
  size = 'default',
  showQuickActions = true,
  showSuggestions = true,
  className,
  initialValue = ''
}: EnhancedSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('agentica_recent_searches') || '[]');
    } catch {
      return [];
    }
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Enhanced search algorithm
  const searchSuggestions = (searchQuery: string): SearchSuggestion[] => {
    if (!searchQuery.trim()) {
      // Show popular suggestions and recent searches when no query
      const popularSuggestions = mockSuggestions.filter(s => s.popular).slice(0, 5);
      const recentSuggestionItems = recentSearches.slice(0, 3).map(search => ({
        id: `recent-${search}`,
        text: search,
        type: 'category' as const,
        icon: <Clock className="w-4 h-4" />,
        description: 'Recent search'
      }));
      return [...recentSuggestionItems, ...popularSuggestions];
    }

    const query = searchQuery.toLowerCase();
    
    return mockSuggestions
      .filter(suggestion => {
        // Multi-field search
        const textMatch = suggestion.text.toLowerCase().includes(query);
        const descriptionMatch = suggestion.description?.toLowerCase().includes(query);
        const typeMatch = suggestion.type.toLowerCase().includes(query);
        
        return textMatch || descriptionMatch || typeMatch;
      })
      .sort((a, b) => {
        // Priority scoring for better relevance
        const aText = a.text.toLowerCase();
        const bText = b.text.toLowerCase();
        
        // Exact matches first
        if (aText === query) return -1;
        if (bText === query) return 1;
        
        // Starts with query second
        if (aText.startsWith(query) && !bText.startsWith(query)) return -1;
        if (bText.startsWith(query) && !aText.startsWith(query)) return 1;
        
        // Popular items next
        if (a.popular && !b.popular) return -1;
        if (b.popular && !a.popular) return 1;
        
        // Agent count for categories/industries
        if (a.agentCount && b.agentCount) {
          return b.agentCount - a.agentCount;
        }
        
        return 0;
      })
      .slice(0, 8); // Limit to 8 results
  };

  useEffect(() => {
    const filtered = searchSuggestions(debouncedQuery);
    setFilteredSuggestions(filtered);
    setIsOpen(showSuggestions && (filtered.length > 0 || debouncedQuery.length > 0));
    setSelectedIndex(-1);
  }, [debouncedQuery, showSuggestions]);

  // Handle initial value
  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updatedRecents = [
      searchQuery,
      ...recentSearches.filter(search => search !== searchQuery)
    ].slice(0, 5); // Keep only 5 recent searches
    
    setRecentSearches(updatedRecents);
    localStorage.setItem('agentica_recent_searches', JSON.stringify(updatedRecents));
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      saveRecentSearch(finalQuery.trim());
      onSearch?.(finalQuery.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    let searchTerm = suggestion.text;
    
    // For recent searches, use the original text
    if (suggestion.id.startsWith('recent-')) {
      searchTerm = suggestion.text;
    }
    
    setQuery(searchTerm);
    onSuggestionSelect?.(suggestion);
    handleSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const sizeClasses = {
    default: 'h-12',
    large: 'h-16 text-lg'
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'agent': return 'text-blue-900 border-blue-400 bg-blue-200 dark:text-blue-100 dark:border-blue-600 dark:bg-blue-800';
      case 'category': return 'text-purple-900 border-purple-400 bg-purple-200 dark:text-purple-100 dark:border-purple-600 dark:bg-purple-800';
      case 'feature': return 'text-green-900 border-green-400 bg-green-200 dark:text-green-100 dark:border-green-600 dark:bg-green-800';
      case 'industry': return 'text-orange-900 border-orange-400 bg-orange-200 dark:text-orange-100 dark:border-orange-600 dark:bg-orange-800';
      case 'voice': return 'text-pink-900 border-pink-400 bg-pink-200 dark:text-pink-100 dark:border-pink-600 dark:bg-pink-800';
      default: return 'text-gray-900 border-gray-400 bg-gray-200 dark:text-gray-100 dark:border-gray-600 dark:bg-gray-800';
    }
  };

  return (
    <div className={cn('relative w-full max-w-4xl mx-auto', className)}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(showSuggestions)}
            className={cn(
              'pl-12 pr-20 border-2 border-gray-400 dark:border-gray-500 hover:border-gray-600 dark:hover:border-gray-400 focus:border-blue-600 dark:focus:border-blue-400 shadow-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium transition-all duration-300',
              sizeClasses[size],
              size === 'large' ? 'rounded-2xl' : 'rounded-xl'
            )}
          />
          
          {/* Clear button */}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Search button */}
          <Button
            onClick={() => handleSearch()}
            size={size === 'large' ? 'lg' : 'sm'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 hover:from-blue-800 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all duration-200 text-white font-bold border border-blue-800"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Suggestions Dropdown */}
        {isOpen && (showSuggestions || query) && (
          <Card 
            ref={dropdownRef}
            className="absolute top-full mt-2 w-full z-50 shadow-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          >
            <CardContent className="p-0 bg-white dark:bg-gray-900">
              {/* Header for different sections */}
              {!query && showSuggestions && recentSearches.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Recent searches</span>
                  </div>
                </div>
              )}
              
              {!query && showSuggestions && recentSearches.length === 0 && (
                <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>Popular searches</span>
                  </div>
                </div>
              )}

              {/* Suggestions List */}
              <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-900">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-200 dark:border-gray-700 last:border-b-0',
                      selectedIndex === index && 'bg-blue-100 dark:bg-blue-900/50'
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold truncate text-gray-900 dark:text-white">{suggestion.text}</span>
                        {suggestion.popular && (
                          <Badge variant="secondary" className="text-xs shrink-0 bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-600 font-bold">
                            Popular
                          </Badge>
                        )}
                      </div>
                      {suggestion.description && (
                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">
                          {suggestion.description}
                        </p>
                      )}
                      {suggestion.agentCount && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold">
                          {suggestion.agentCount} agents available
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs capitalize font-bold', getTypeColor(suggestion.type))}
                      >
                        {suggestion.type}
                      </Badge>
                    </div>
                  </button>
                ))}

                {query && filteredSuggestions.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No suggestions found for "{query}"</p>
                    <p className="text-sm mt-1">Try searching for agent types, industries, or features</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => handleSearch()}
                    >
                      Search anyway
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {showQuickActions && !isOpen && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Quick actions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-600/5 hover:border-primary/20 transition-all duration-200"
                onClick={action.onClick}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="text-primary">{action.icon}</div>
                  <span className="text-sm font-medium text-left flex-1">{action.label}</span>
                </div>
                {action.description && (
                  <span className="text-xs text-muted-foreground text-left w-full">
                    {action.description}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified version for header/navbar
export function CompactSearch({ onSearch, className }: { onSearch?: (query: string) => void; className?: string }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick suggestions for compact search
  const compactSuggestions = mockSuggestions.filter(s => s.popular).slice(0, 5);

  useEffect(() => {
    if (query.trim()) {
      const filtered = compactSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch?.(suggestion.text);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 w-4 h-4" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search agents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        onFocus={() => query.trim() && setIsOpen(true)}
        className="pl-10 pr-4 h-9 w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-500 hover:border-gray-600 dark:hover:border-gray-400 focus:border-blue-600 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-white font-medium shadow-lg"
      />
      
      {/* Compact Suggestions */}
      {isOpen && filteredSuggestions.length > 0 && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full mt-1 w-full z-50 shadow-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
        >
          <CardContent className="p-0 bg-white dark:bg-gray-900">
            <div className="max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-gray-600 dark:text-gray-400">{suggestion.icon}</div>
                  <span className="flex-1 truncate text-gray-900 dark:text-white font-medium">{suggestion.text}</span>
                  <Badge variant="outline" className={cn('text-xs font-bold', getTypeColor(suggestion.type))}>
                    {suggestion.type}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}