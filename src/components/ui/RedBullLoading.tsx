import React from 'react';

interface RedBullLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const RedBullLoading: React.FC<RedBullLoadingProps> = ({ 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm' 
    : 'flex items-center justify-center w-full h-full';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Red Bull Wings Effect */}
        <div className="absolute inset-0 animate-energy-pulse">
          <div className={`${sizeClasses[size]} relative`}>
            {/* Left Wing */}
            <div className="absolute left-0 w-1/2 h-full transform origin-right">
              <div className="absolute right-0 w-full h-1 bg-[var(--brand-red)] animate-loading-spin neon-glow-red"></div>
              <div className="absolute right-0 w-1 h-full bg-[var(--brand-red)] animate-loading-spin neon-glow-red"></div>
            </div>
            {/* Right Wing */}
            <div className="absolute right-0 w-1/2 h-full transform origin-left">
              <div className="absolute left-0 w-full h-1 bg-[var(--brand-red)] animate-loading-spin neon-glow-red"></div>
              <div className="absolute left-0 w-1 h-full bg-[var(--brand-red)] animate-loading-spin neon-glow-red"></div>
            </div>
          </div>
        </div>

        {/* Energy Ring */}
        <div className="absolute inset-0">
          <div className={`${sizeClasses[size]} rounded-full border-4 border-[var(--brand-silver)] animate-loading-spin neon-glow-silver`}></div>
        </div>
        
        {/* Inner Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-20 h-20' : 'w-24 h-24'} bg-[var(--brand-red)]/10 rounded-full animate-pulse`}></div>
        </div>

        {/* Loading Text */}
        {fullScreen && (
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-[var(--brand-silver)] text-lg font-bold animate-pulse neon-text-silver">
              Loading...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};