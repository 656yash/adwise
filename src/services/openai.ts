// OpenAI API service for chatbot
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private apiKey: string | null = import.meta.env.VITE_OPENAI_API_KEY || null;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    // Auto-set the API key
    if (this.apiKey) {
      localStorage.setItem('openai_api_key', this.apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    // Store in localStorage for persistence
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      // Try to get from localStorage
      this.apiKey = localStorage.getItem('openai_api_key');
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }

  async sendMessage(userMessage: string, conversationHistory: OpenAIMessage[] = []): Promise<string> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please set your API key in settings.');
    }

    const systemPrompt: OpenAIMessage = {
      role: 'system',
      content: `You are an AI Analytics Assistant for a KPI Dashboard. You help users analyze their marketing campaign data and provide insights.

Context: The user has access to a KPI Dashboard showing real campaign data:
- Campaign performance across platforms (Instagram, YouTube, LinkedIn, Twitter)  
- Metrics like ROAS, ROI, CPC, CTR, impressions, clicks, conversions
- Budget and spending data in Indian Rupees (₹)
- Campaign names like "New Launch", "Gaming Night", "Summer Vibes", "Energy Box", "Extreme Sports"
- Data from January 2024 to December 2024
- 20 total campaigns with real performance metrics

Your role:
1. Analyze campaign performance data
2. Provide actionable insights and recommendations
3. Explain marketing metrics in simple terms
4. Suggest optimization strategies
5. Help with budget allocation decisions

Keep responses concise, actionable, and focused on marketing insights. Use bullet points and clear formatting when helpful.`
    };

    const messages: OpenAIMessage[] = [
      systemPrompt,
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      console.log('Sending OpenAI request with:', {
        model: 'gpt-3.5-turbo',
        messagesCount: messages.length,
        apiKeyLength: apiKey.length
      });
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Response:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 400) {
          throw new Error('Bad request. Please check your message format.');
        } else {
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  // Test API key validity
  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key...');
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      console.log('API key test response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('API key test error:', error);
      return false;
    }
  }
}

export const openAIService = new OpenAIService();
