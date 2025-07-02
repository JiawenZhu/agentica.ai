import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { EnhancedSearch } from '../EnhancedSearch';
import { 
  Bot, 
  Zap, 
  Users, 
  ShoppingCart, 
  ArrowRight,
  Sparkles,
  Mic,
  Globe,
  TrendingUp,
  Clock,
  Mail,
  Twitter,
  Linkedin,
  Github,
  MessageSquare
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Deploy in Seconds",
    description: "Get your AI agent live on your website with just a few clicks"
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Pre-trained Agents",
    description: "Choose from hundreds of specialized agents ready to use"
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Natural Voice",
    description: "Powered by advanced voice AI for human-like conversations"
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Any Website",
    description: "Works with any website, no coding required"
  }
];

const useCases = [
  {
    title: "Customer Support",
    description: "24/7 intelligent customer service",
    icon: <Users className="w-8 h-8" />,
    color: "from-blue-500 to-cyan-500",
    agents: "150+ agents"
  },
  {
    title: "Sales Assistant",
    description: "Convert visitors into customers",
    icon: <ShoppingCart className="w-8 h-8" />,
    color: "from-green-500 to-emerald-500",
    agents: "120+ agents"
  },
  {
    title: "Lead Generation",
    description: "Qualify and capture leads automatically",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "from-purple-500 to-violet-500",
    agents: "80+ agents"
  },
  {
    title: "Appointment Booking",
    description: "Schedule meetings and appointments",
    icon: <Clock className="w-8 h-8" />,
    color: "from-orange-500 to-red-500",
    agents: "60+ agents"
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechFlow",
    image: "https://images.unsplash.com/photo-1494790108755-2616b2e88362?w=100&h=100&fit=crop&crop=face",
    content: "Agentica.ai transformed our customer support. We've seen a 40% reduction in response time and our customers love the instant, intelligent assistance."
  },
  {
    name: "Marcus Rodriguez",
    role: "Founder, GrowthLab",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", 
    content: "The lead qualification agent is incredible. It's like having a sales expert working 24/7. Our conversion rate has increased by 35%."
  },
  {
    name: "Emily Watson",
    role: "VP Marketing, InnovateCorp",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "Easy to set up, powerful results. Our appointment booking agent handles hundreds of inquiries weekly without any issues."
  }
];

const trustLogos = [
  { name: "TechCorp", logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop&crop=center" },
  { name: "InnovateInc", logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=120&h=60&fit=crop&crop=center" },
  { name: "StartupXYZ", logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop&crop=center" },
  { name: "Enterprise Co", logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=120&h=60&fit=crop&crop=center" }
];

const stats = [
  { value: "500+", label: "AI Agents Available" },
  { value: "10K+", label: "Websites Using Our Agents" },
  { value: "1M+", label: "Conversations Handled" },
  { value: "99.9%", label: "Uptime Guarantee" }
];

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSignup, setEmailSignup] = useState('');
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    // Handle different suggestion types appropriately
    if (suggestion.type === 'industry') {
      navigate(`/marketplace?category=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'agent' || suggestion.type === 'category') {
      navigate(`/marketplace?search=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'feature') {
      navigate(`/marketplace?search=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'voice') {
      navigate(`/marketplace?voice=${encodeURIComponent(suggestion.text)}`);
    } else {
      // Default to search
      navigate(`/marketplace?search=${encodeURIComponent(suggestion.text)}`);
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSignup.trim()) return;

    setIsSignupLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Thanks for subscribing! You\'ll receive updates about new agents and features.');
      setEmailSignup('');
      setIsSignupLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto text-center">
          {/* Beta Badge */}
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border-primary/20 px-4 py-2 text-sm animate-float">
              <Sparkles className="w-4 h-4 mr-2" />
              New: The AI Agent Revolution is here
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-6 bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent leading-tight">
              What AI agent can I help you deploy?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose from hundreds of pre-built AI voice agents or create your own. 
              Deploy intelligent conversations on your website in seconds.
            </p>
          </div>

          {/* Enhanced Search with Visual Cue */}
          <div className="max-w-4xl mx-auto mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-600/10 to-purple-600/10 rounded-3xl blur-xl animate-pulse"></div>
            <div className="relative">
              <EnhancedSearch
                placeholder="Describe the AI agent you need... (e.g., customer support, sales assistant, lead qualifier)"
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                size="large"
                showQuickActions={true}
                showSuggestions={true}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-2xl md:text-3xl font-semibold text-primary mb-1 group-hover:scale-110 transition-transform duration-200">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Deploy AI Agents in 3 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From search to deployment in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Search & Choose",
                description: "Browse our marketplace or search for the perfect AI agent for your needs",
                icon: <Bot className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "Customize & Test",
                description: "Adjust the agent's personality, voice, and knowledge base to match your brand",
                icon: <Sparkles className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Deploy & Go Live",
                description: "Copy the embed code and paste it into your website. Your agent is now live!",
                icon: <Zap className="w-8 h-8" />
              }
            ].map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div className="text-3xl font-bold text-muted-foreground/30">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/30 w-8 h-8" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Popular Agent Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover agents built for your industry and use case
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {useCases.map((useCase, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
                onClick={() => navigate(`/marketplace?category=${encodeURIComponent(useCase.title)}`)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${useCase.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 animate-float`}>
                    {useCase.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{useCase.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {useCase.agents}
                  </Badge>
                </CardContent>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Browse All Categories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of businesses already transforming their customer interactions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Why Choose Agentica.ai?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most advanced AI agent platform built for modern businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-600/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-muted-foreground mb-8">Trusted by innovative companies worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              {trustLogos.map((company, index) => (
                <div key={index} className="text-center group">
                  <ImageWithFallback
                    src={company.logo}
                    alt={company.name}
                    className="h-12 mx-auto grayscale hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary/5 via-blue-600/5 to-purple-600/5 rounded-3xl p-8 md:p-12 border">
            <Mail className="w-12 h-12 mx-auto mb-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Stay Updated with AI Innovations
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the latest updates on new AI agents, features, and industry insights delivered to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={emailSignup}
                onChange={(e) => setEmailSignup(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                disabled={isSignupLoading}
                className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:shadow-lg transition-all duration-200"
              >
                {isSignupLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground mt-4">
              No spam, unsubscribe at any time
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold mb-4">
            Ready to Deploy Your AI Agent?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of businesses already using Agentica.ai to automate their customer interactions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/marketplace')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:scale-105 transition-all duration-200"
            >
              Browse Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/create')}
              className="border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-200"
            >
              Create Custom Agent
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-muted/30 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Agentica.ai</h3>
              <p className="text-muted-foreground text-sm">
                The ultimate marketplace for AI voice agents. Deploy intelligent conversations in seconds.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                  <Github className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors block">Marketplace</a>
                <a href="/create" className="text-muted-foreground hover:text-foreground transition-colors block">Create Agent</a>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors block">Dashboard</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">API</a>
              </div>
            </div>

            {/* Use Cases */}
            <div className="space-y-4">
              <h4 className="font-semibold">Use Cases</h4>
              <div className="space-y-2 text-sm">
                <a href="/marketplace?category=Customer Support" className="text-muted-foreground hover:text-foreground transition-colors block">Customer Support</a>
                <a href="/marketplace?category=Sales Assistant" className="text-muted-foreground hover:text-foreground transition-colors block">Sales Assistant</a>
                <a href="/marketplace?category=Lead Generation" className="text-muted-foreground hover:text-foreground transition-colors block">Lead Generation</a>
                <a href="/marketplace?category=Appointment Booking" className="text-muted-foreground hover:text-foreground transition-colors block">Appointment Booking</a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Documentation</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Help Center</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Contact</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors block">Status</a>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 Agentica.ai. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}