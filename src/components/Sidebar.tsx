import React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, activeTab, onTabChange, isMobile = false, isOpen = true, onClose }: SidebarProps) {
  return (
    <div className={cn(
      "w-64 bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl h-full mobile-sidebar"
    )}>
      <div className="p-6 border-b border-[var(--electric-blue)] flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sidebar-foreground neon-text-blue neon-pulse-blue">Ad-Wise</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-[var(--neon-pink)] transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 pt-4">
        <ul className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 lg:py-3 rounded-lg transition-all duration-300",
                    "touch-manipulation", // Better touch experience on mobile
                    "py-4 lg:py-3", // Larger touch targets on mobile
                    isActive
                      ? "bg-sidebar-accent text-[var(--electric-blue)] neon-border-blue shadow-lg transform scale-105"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-[var(--neon-pink)] hover:neon-border-pink hover:shadow-md hover:transform hover:scale-102"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "neon-glow-blue text-[var(--electric-blue)]" : "group-hover:text-[var(--neon-pink)] group-hover:neon-glow-pink"
                  )} />
                  <span className={cn(
                    "transition-all duration-300",
                    isActive ? "font-semibold" : ""
                  )}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}