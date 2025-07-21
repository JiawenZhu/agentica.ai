import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { VoicePreview } from './VoicePreview';
import { UsageModal } from './UsageModal';
import { useFavorites, useCart } from '../contexts/AppContext';
import { toast } from 'sonner';
import { 
  Play, 
  Star, 
  Users, 
  Heart, 
  ShoppingCart,
  ExternalLink,
  MoreVertical,
  Share2,
  Info,
  Activity,
  DollarSign
} from 'lucide-react';

interface Agent {
  id: string | number;
  name: string;
  description: string;
  avatar: string;
  tags: string[];
  rating: number;
  users: number;
  price: string;
  industry: string;
  voiceProvider: string;
  creator?: string;
}

interface EnhancedAgentCardProps {
  agent: Agent;
  variant?: 'grid' | 'list';
  showActions?: boolean;
  className?: string;
}

export function EnhancedAgentCard({ 
  agent, 
  variant = 'grid', 
  showActions = true,
  className = "" 
}: EnhancedAgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart, cart } = useCart();
  
  const isInCart = cart.some(item => item.id === agent.id);
  const isFavorited = isFavorite(agent.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(agent.id);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart && agent.price !== 'Free') {
      addToCart(agent);
      toast.success('Added to cart');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: agent.name,
        text: agent.description,
        url: `/agent/${agent.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/agent/${agent.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleUsageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUsageModal(true);
  };

  const isPaid = agent.price !== 'Free';

  if (variant === 'list') {
    return (
      <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.split(' ')[0][0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-medium truncate">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="outline">{agent.price}</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {agent.rating}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <VoicePreview 
                    voiceId={agent.voiceProvider.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    voiceName={agent.name}
                    size="sm"
                  />
                  
                  {showActions && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleUsageClick}
                              className="text-muted-foreground hover:text-green-600"
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View usage & costs</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleFavorite}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Button size="sm" asChild>
                        <Link to={`/agent/${agent.id}`}>
                          View Details
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Usage Modal */}
        <UsageModal
          isOpen={showUsageModal}
          onClose={() => setShowUsageModal(false)}
          agentName={agent.name}
          agentId={agent.id}
        />
      </Card>
    );
  }

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/agent/${agent.id}`} className="block">
        <CardHeader className="text-center relative">
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUsageClick}
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View usage & costs</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFavorite}
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share agent</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src={agent.avatar} alt={agent.name} />
            <AvatarFallback>{agent.name.split(' ')[0][0]}</AvatarFallback>
          </Avatar>
          
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {agent.description}
          </CardDescription>
          
          {agent.creator && (
            <p className="text-xs text-muted-foreground mt-1">
              by {agent.creator}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {agent.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {agent.tags.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs cursor-help">
                      +{agent.tags.length - 3}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {agent.tags.slice(3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {agent.rating}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {agent.users.toLocaleString()}
            </div>
            <Badge variant="outline" className="text-xs">
              {agent.price}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <VoicePreview 
              voiceId={agent.voiceProvider.toLowerCase().replace(/[^a-z0-9]/g, '-')}
              voiceName={agent.name}
              className="flex-1"
            />
            
            {showActions && isPaid && !isInCart && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddToCart}
                      className="min-w-0 px-3"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to cart</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {isHovered && (
            <Button className="w-full" size="sm">
              View Details
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardContent>
      </Link>
      
      {/* Usage Modal */}
      <UsageModal
        isOpen={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        agentName={agent.name}
        agentId={agent.id}
      />
    </Card>
  );
}