import { Bot, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'minimal';
}

export function Logo({ 
  className = "", 
  size = 'md', 
  showText = true, 
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: showText ? 'h-6' : 'h-6 w-6',
    md: showText ? 'h-8' : 'h-8 w-8',
    lg: showText ? 'h-12' : 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-primary via-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {size !== 'sm' && (
            <Sparkles className="w-3 h-3 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
          )}
        </div>
        {showText && (
          <span className={`ml-2 font-semibold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            Agentica
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      <div className="relative">
        {/* Main logo background with gradient */}
        <div className="relative w-8 h-8 bg-gradient-to-br from-primary via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
          
          {/* Bot icon */}
          <Bot className={`${iconSizes[size]} text-white relative z-10`} />
          
          {/* Animated pulse effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-purple-600/50 rounded-xl animate-pulse opacity-50" />
        </div>
        
        {/* Floating sparkle effect */}
        {size !== 'sm' && (
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-purple-400/30 rounded-full animate-ping" />
          </div>
        )}
      </div>
      
      {showText && (
        <div className="ml-2 flex items-center">
          <span className={`font-semibold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            Agentica
          </span>
          <span className={`text-muted-foreground ${textSizes[size]} ml-0.5`}>
            .ai
          </span>
        </div>
      )}
    </div>
  );
}

// Alternative logo variations
export function LogoIcon({ className = "", size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <Logo className={className} size={size} showText={false} />;
}

export function LogoWithBeta({ className = "", size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center gap-2">
      <Logo className={className} size={size} />
      <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
        BETA
      </span>
    </div>
  );
}