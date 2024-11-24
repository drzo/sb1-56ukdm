import React, { useState } from 'react';
import { X, Key } from 'lucide-react';
import { useStore } from '../store';
import { initializeAssistant } from '../api/openai';

export default function TokenModal() {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { 
    setOpenAIToken, 
    showOpenAITokenModal, 
    setShowOpenAITokenModal,
    setError
  } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || isValidating) return;

    setIsValidating(true);
    setValidationError(null);
    
    try {
      // First save the token so initializeAssistant can use it
      setOpenAIToken(token.trim());
      
      // Try to initialize the assistant
      await initializeAssistant();
      
      setShowOpenAITokenModal(false);
      setToken('');
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate OpenAI token';
      setValidationError(message);
      setOpenAIToken(null);
    } finally {
      setIsValidating(false);
    }
  };

  if (!showOpenAITokenModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Configure OpenAI Access</h2>
          </div>
          <button
            onClick={() => setShowOpenAITokenModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="sk-..."
                required
                disabled={isValidating}
              />
            </div>
            {validationError && (
              <p className="text-sm text-red-600 mt-1">{validationError}</p>
            )}
            <p className="text-sm text-gray-500">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                OpenAI Dashboard
              </a>
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowOpenAITokenModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              disabled={isValidating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isValidating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isValidating}
            >
              {isValidating ? 'Validating...' : 'Save Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}