import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Key, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { openAIService } from '../services/openai';

interface ApiSettingsProps {
  onClose?: () => void;
}

export function ApiSettings({ onClose }: ApiSettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Load existing API key
    const existingKey = openAIService.getApiKey();
    if (existingKey) {
      setApiKey(existingKey);
      setKeyStatus('valid');
      setStatusMessage('API key loaded from storage');
    }
  }, []);

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setStatusMessage('Please enter an API key');
      return;
    }

    setIsTestingKey(true);
    setStatusMessage('Testing API key...');

    try {
      const isValid = await openAIService.testApiKey(apiKey.trim());
      
      if (isValid) {
        setKeyStatus('valid');
        setStatusMessage('API key is valid and working!');
        openAIService.setApiKey(apiKey.trim());
      } else {
        setKeyStatus('invalid');
        setStatusMessage('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      setKeyStatus('invalid');
      setStatusMessage('Error testing API key. Please check your connection.');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveKey = () => {
    if (keyStatus === 'valid') {
      openAIService.setApiKey(apiKey.trim());
      setStatusMessage('API key saved successfully!');
      if (onClose) {
        setTimeout(onClose, 1000);
      }
    } else {
      setStatusMessage('Please test the API key first');
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    setKeyStatus('none');
    setStatusMessage('');
    openAIService.clearApiKey();
  };

  const getStatusIcon = () => {
    switch (keyStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Key className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (keyStatus) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>OpenAI API Configuration</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenAI API Key</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleTestApiKey}
                disabled={isTestingKey || !apiKey.trim()}
                variant="outline"
              >
                {isTestingKey ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <Alert className={keyStatus === 'valid' ? 'border-green-200 bg-green-50' : keyStatus === 'invalid' ? 'border-red-200 bg-red-50' : ''}>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <AlertDescription>{statusMessage}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveKey}
              disabled={keyStatus !== 'valid'}
              className="flex-1"
            >
              Save Configuration
            </Button>
            <Button
              onClick={handleClearKey}
              variant="outline"
              disabled={!apiKey}
            >
              Clear
            </Button>
          </div>

          {/* Instructions */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">How to get your OpenAI API Key:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit the OpenAI Platform website</li>
              <li>Sign in to your account or create a new one</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new secret key</li>
              <li>Copy and paste it above</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open OpenAI Platform
            </Button>
          </div>

          {/* Security Note */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Security:</strong> Your API key is stored locally in your browser and never sent to our servers. 
              It's only used to communicate directly with OpenAI's API.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
