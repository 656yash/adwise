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
    // Apply dark theme to document
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');

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
    }, 2000); // Reduced to 2 seconds

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
      <div className="flex items-center justify-center h-screen bg-background dark" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00f3ff] mb-4 mx-auto"></div>
          <p className="text-lg" style={{color: '#00f3ff'}}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background dark" style={{backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh'}}>
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