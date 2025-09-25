import React, { useState } from 'react';
import { LucideIcon, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from './ui/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TopNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TopNavigation({ 
  items, 
  activeTab, 
  onTabChange
}: TopNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-card border-b border-[var(--electric-blue)] shadow-2xl relative z-50">
        <div className="h-full px-6 lg:px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
          {/* Left: Brand Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold top-nav-brand brand-glow">
              Ad-Wise
            </h1>
          </div>

          {/* Center: Navigation Menu */}
          <div className="flex items-center space-x-6 sm:space-x-8 flex-1 justify-center max-w-4xl mx-auto">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "flex items-center space-x-0 sm:space-x-3 px-2 sm:px-5 py-2 sm:py-3 rounded-lg transition-all duration-300",
                    "nav-item-hover text-sm sm:text-base nav-spacing",
                    isActive
                      ? "nav-item-active text-[var(--electric-blue)]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-[var(--neon-pink)]"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300",
                    isActive ? "neon-glow-blue text-[var(--electric-blue)]" : ""
                  )} />
                  <span className={cn(
                    "transition-all duration-300 font-medium hidden sm:inline nav-text-safe",
                    isActive ? "font-semibold" : ""
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Empty space for balance */}
          <div className="flex items-center">
            {/* Removed user profile and mobile menu */}
          </div>
        </div>

        {/* Mobile Dropdown Menu - Hidden since we show tabs directly */}
        <div className="hidden">
          {/* Dropdown content removed since tabs are always visible */}
        </div>
      </nav>

      {/* Mobile Menu Overlay - Removed since tabs are always visible */}
    </>
  );
}
