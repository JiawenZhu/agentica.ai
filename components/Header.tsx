import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Menu, ChevronDown, Sparkles, Bot, Mic, Users } from 'lucide-react';
import { Logo, LogoWithBeta } from './Logo';
import { CompactSearch } from './EnhancedSearch';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  // Quick action items for marketplace dropdown
  const marketplaceActions = [
    { 
      label: 'Browse All Agents', 
      path: '/marketplace', 
      icon: <Bot className="w-4 h-4" />,
      description: 'Explore our full marketplace'
    },
    { 
      label: 'Customer Support', 
      path: '/marketplace?category=Customer Support', 
      icon: <Users className="w-4 h-4" />,
      description: 'Support & service agents'
    },
    { 
      label: 'Sales Assistants', 
      path: '/marketplace?category=Sales Assistant', 
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Lead generation & sales'
    },
    { 
      label: 'Voice Agents', 
      path: '/marketplace?voice=Retell.ai', 
      icon: <Mic className="w-4 h-4" />,
      description: 'Voice-enabled agents'
    },
  ];

  const handleSearch = (query: string) => {
    // Navigate to marketplace with search query
    if (query.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false); // Close mobile menu if open
    }
  };

  const NavLinks = ({ mobile = false, onClose = () => {} }) => (
    <nav className={`${mobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center gap-6'}`}>
      {navItems.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          onClick={onClose}
          className={`hover:text-primary transition-colors duration-200 ${
            isActive(path) 
              ? 'text-primary font-medium' 
              : 'text-muted-foreground hover:text-foreground'
          } ${mobile ? 'text-lg py-2' : ''}`}
        >
          {label}
        </Link>
      ))}
      
      {/* Marketplace Dropdown - Desktop */}
      {!mobile && (
        <DropdownMenu>
          <DropdownMenuTrigger className={`flex items-center gap-1 hover:text-primary transition-colors duration-200 ${
            location.pathname === '/marketplace' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}>
            Marketplace
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-2">
            {marketplaceActions.map((action) => (
              <DropdownMenuItem
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-600/5"
              >
                <div className="text-primary mt-0.5">{action.icon}</div>
                <div>
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Mobile Marketplace Links */}
      {mobile && (
        <div className="space-y-2">
          <div className="text-lg py-2 font-medium text-muted-foreground">Marketplace</div>
          {marketplaceActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              onClick={onClose}
              className="flex items-center gap-3 pl-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {action.icon}
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      )}
      
      <Link
        to="/create"
        onClick={onClose}
        className={`hover:text-primary transition-colors duration-200 ${
          isActive('/create') 
            ? 'text-primary font-medium' 
            : 'text-muted-foreground hover:text-foreground'
        } ${mobile ? 'text-lg py-2' : ''}`}
      >
        Create Agent
      </Link>
    </nav>
  );

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="transition-transform hover:scale-105 duration-200 flex-shrink-0">
          <LogoWithBeta size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <NavLinks />
        </div>

        {/* Search Bar - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <CompactSearch onSearch={handleSearch} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10 transition-all duration-200"
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-200 animate-glow"
            >
              Get Started
            </Button>
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              {/* Required for accessibility */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation menu with links to different sections of the website.
              </SheetDescription>
              
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <Logo size="sm" />
                </div>
                
                {/* Mobile Search */}
                <div className="py-4">
                  <CompactSearch onSearch={handleSearch} className="w-full" />
                </div>
                
                {/* Mobile Navigation */}
                <div className="flex-1 py-2">
                  <NavLinks mobile onClose={() => setIsOpen(false)} />
                </div>
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10" 
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 shadow-lg" 
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}