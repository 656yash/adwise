import React from 'react';

export const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
      <div className="relative">
        {/* Main Energy Ring */}
        <div className="absolute inset-0 animate-energy-pulse">
          <div className="w-32 h-32 rounded-full border-4 border-[var(--electric-blue)] animate-loading-spin neon-glow-blue"></div>
        </div>
        
        {/* Inner Pulsing Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-[var(--electric-blue)]/10 rounded-full animate-pulse"></div>
        </div>
        
        {/* Cross Lines */}
        <div className="absolute inset-0 animate-loading-spin">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--neon-pink)] transform -translate-y-1/2 neon-glow-pink"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-[var(--neon-pink)] transform -translate-x-1/2 neon-glow-pink"></div>
        </div>

        {/* Loading Text */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-[var(--electric-blue)] text-lg font-bold animate-pulse neon-text-blue">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
};