import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { Dashboard } from './components/Dashboard';
import { KPIVisualization } from './components/KPIVisualization';
import { DataDetails } from './components/DataDetails';
import { Chatbot } from './components/Chatbot';
import { BarChart3, PieChart, Database, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for required environment variables
    const checkEnvironment = () => {
      try {
        if (!import.meta.env.VITE_OPENAI_API_KEY && !localStorage.getItem('openai_api_key')) {
          console.warn('OpenAI API key not configured');
        }
      } catch (err) {
        console.error('Environment check failed:', err);
        setError('Application configuration error. Please check the console for details.');
      }
    };

    checkEnvironment();

    // Simulate loading time for the Red Bull loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 4 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'kpi':
        return <KPIVisualization />;
      case 'data':
        return <DataDetails />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return <Dashboard />;
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'kpi', label: 'KPI Visualization', icon: PieChart },
    { id: 'data', label: 'Detailed Data', icon: Database },
    { id: 'chatbot', label: 'AI Analysis', icon: MessageSquare },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background dark">
        <div className="text-center">
          <p className="text-lg text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background dark">
      {error ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500 text-center p-4">
            {error}
          </div>
        </div>
      ) : (
        <>
          <TopNavigation
            items={navigationItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <main className="flex-1 overflow-auto p-4 lg:p-6 cyberpunk-bg">
            {renderActiveComponent()}
          </main>
        </>
      )}
    </div>
  );
}