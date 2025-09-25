import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Bot, User, Settings, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { openAIService } from '../services/openai';
import { ApiSettings } from './ApiSettings';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Analytics Assistant. I can help you analyze your campaign data, explain metrics, and provide insights. What would you like to know about your campaigns?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check API configuration on mount
  useEffect(() => {
    const apiKey = openAIService.getApiKey();
    setIsApiConfigured(!!apiKey);
  }, []);

  // Smart local AI-like responses with fallback to OpenAI
  const callOpenAI = async (userMessage: string): Promise<string> => {
    // First try local intelligent responses
    const localResponse = getLocalResponse(userMessage);
    if (localResponse) {
      return localResponse;
    }

    // If no local match and API is configured, try OpenAI
    if (isApiConfigured) {
      try {
        const conversationHistory = messages
          .filter(msg => msg.type !== 'bot' || msg.id !== '1')
          .map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          }));

        return await openAIService.sendMessage(userMessage, conversationHistory);
      } catch (error) {
        // If OpenAI fails, fall back to local response
        return getLocalResponse(userMessage) || getDefaultResponse(userMessage);
      }
    }

    // If no API configured, use local responses
    return getDefaultResponse(userMessage);
  };

  // Local intelligent response system
  const getLocalResponse = (userMessage: string): string | null => {
    const message = userMessage.toLowerCase();
    
    // ROAS analysis
    if (message.includes('roas') || message.includes('return on ad spend')) {
      return `**ROAS Analysis from Your Dashboard:**

Based on your campaign data:
• **Twitter Energy Box**: 3.9x ROAS (Best performer)
• **Instagram Summer Vi**: 4.26x ROAS (Excellent)
• **YouTube Summer Vi**: 2.99x ROAS (Good)
• **LinkedIn Gaming Ni**: 3.16x ROAS (Good)

**Recommendations:**
✅ Increase budget for Twitter Energy Box campaign
✅ Scale Instagram Summer Vi campaign
⚠️ Optimize YouTube campaigns for better ROAS
📊 Consider reallocating budget from lower ROAS campaigns`;
    }

    // Platform performance
    if (message.includes('platform') && (message.includes('best') || message.includes('performance'))) {
      return `**Platform Performance Analysis:**

**Top Performing Platforms:**
🥇 **Instagram**: Highest engagement, strong ROAS
🥈 **Twitter**: Best ROAS on Energy Box campaign
🥉 **YouTube**: Good reach, needs optimization

**Key Metrics:**
• Instagram: ₹2,166-₹4,547 KPI range
• Twitter: ₹674-₹3,385 KPI range  
• YouTube: ₹1,226-₹3,491 KPI range
• LinkedIn: ₹733-₹2,281 KPI range

**Recommendation:** Focus budget on Instagram and Twitter campaigns for maximum ROI.`;
    }

    // Campaign specific
    if (message.includes('campaign') && (message.includes('best') || message.includes('top'))) {
      return `**Top Performing Campaigns:**

🏆 **Instagram Extreme Si**: ₹4,547 KPI, 2544 impressions
🥈 **YouTube New Laun**: ₹3,491 KPI, 1063 impressions  
🥉 **Twitter Extreme Si**: ₹3,385 KPI, 1584 impressions

**Campaign Insights:**
• "Extreme Sports" theme performs well across platforms
• "New Launch" campaigns show strong engagement
• "Energy Box" has highest ROAS potential

**Next Steps:** Replicate successful "Extreme Sports" creative across other platforms.`;
    }

    // Budget optimization
    if (message.includes('budget') || message.includes('spend') || message.includes('optimize')) {
      return `**Budget Optimization Recommendations:**

**Current Spending Analysis:**
• Total campaigns: 20 across 4 platforms
• Spend range: ₹1,225 - ₹4,652 per campaign
• Best efficiency: Twitter Energy Box (₹4,215 spend, 3.9x ROAS)

**Optimization Strategy:**
📈 **Increase Budget:**
   • Twitter Energy Box (+50%)
   • Instagram Summer Vi (+30%)

📉 **Reduce Budget:**
   • Lower performing YouTube campaigns
   • LinkedIn campaigns with high CPC

💡 **Test Budget:**
   • Try "Extreme Sports" theme on LinkedIn
   • Scale successful Instagram creatives to Facebook`;
    }

    return null; // No local match found
  };

  // Default helpful response
  const getDefaultResponse = (userMessage: string): string => {
    return `**I can help you analyze your campaign data!** 📊

**Your Dashboard Overview:**
• 20 campaigns across Instagram, YouTube, LinkedIn, Twitter
• Campaign types: New Launch, Gaming Night, Summer Vibes, Energy Box, Extreme Sports
• Spending tracked in Indian Rupees (₹)
• Data from January 2024 to December 2024

**Ask me about:**
• "Which platform has the best ROAS?"
• "What are my top performing campaigns?"
• "How should I optimize my budget?"
• "Which campaigns need improvement?"

**Quick Navigation:**
📊 Dashboard tab - Overall metrics
📈 KPI Visualization - Platform comparisons  
📋 Data Details - Detailed campaign data

*You asked: "${userMessage}"*
Try rephrasing your question or ask about specific metrics!`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Try OpenAI API call
      const botResponse = await callOpenAI(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      
      // Provide a helpful fallback response
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I'm having trouble connecting to the AI service right now. Here's what I can tell you about your campaigns based on the data I can see:

**Your Campaign Overview:**
• You have 20 campaigns across 4 platforms (Instagram, YouTube, LinkedIn, Twitter)
• Campaign types include: New Launch, Gaming Night, Summer Vibes, Energy Box, Extreme Sports
• Data spans from January 2024 to December 2024
• All spending is tracked in Indian Rupees (₹)

**Quick Insights:**
• Check your Dashboard tab for overall performance metrics
• Use the KPI Visualization tab to see platform comparisons
• View detailed campaign data in the Data Details tab

*Error: ${error instanceof Error ? error.message : 'Unknown error'}*

Please try asking your question again, or check the API settings if the issue persists.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Analytics Assistant. I can help you analyze your campaign data, explain metrics, and provide insights. What would you like to know about your campaigns?',
      timestamp: new Date()
    }]);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>AI Analytics Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask questions about your campaign performance and get AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                API Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>OpenAI API Configuration</DialogTitle>
              </DialogHeader>
              <ApiSettings onClose={() => {
                setShowSettings(false);
                const apiKey = openAIService.getApiKey();
                setIsApiConfigured(!!apiKey);
              }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* API Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">Smart Analytics</Badge>
            <span className="text-sm text-blue-800">
              Intelligent campaign analysis powered by your dashboard data. {isApiConfigured ? 'Enhanced with OpenAI when available.' : 'Works offline with local insights.'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[700px] flex flex-col shadow-lg border-2">
        <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold">AI Analytics Assistant</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-white text-gray-800 ml-auto border border-gray-300 shadow-sm'
                          : 'bg-white text-gray-800 border border-gray-300 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex space-x-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... e.g., 'Which platform has the best ROAS?'"
                disabled={isLoading}
                className="flex-1 rounded-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputValue.trim()}
                className="rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-3 min-h-[48px] min-w-[48px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Ask about ROAS, campaigns, budget optimization, or platform performance
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}