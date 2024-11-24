import React, { useState } from 'react';
import { X, Github, Key } from 'lucide-react';
import { useStore } from '../store';
import { getCurrentUser } from '../api/github';

export default function GitHubTokenModal() {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { 
    setGitHubToken, 
    setGitHubUser,
    showGitHubTokenModal, 
    setShowGitHubTokenModal,
    setError 
  } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || isValidating) return;

    setIsValidating(true);
    setValidationError(null);
    
    try {
      // Set token first so getCurrentUser can use it
      setGitHubToken(token.trim());
      
      // Validate token by fetching user data
      const user = await getCurrentUser();
      setGitHubUser(user);
      setShowGitHubTokenModal(false);
      setToken(''); // Clear the input after saving
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid GitHub token';
      setValidationError(message);
      setGitHubToken(null); // Clear invalid token
      setGitHubUser(null);
    } finally {
      setIsValidating(false);
    }
  };

  if (!showGitHubTokenModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Github className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Configure GitHub Access</h2>
          </div>
          <button
            onClick={() => setShowGitHubTokenModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Personal Access Token
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
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                required
                disabled={isValidating}
              />
            </div>
            {validationError && (
              <p className="text-sm text-red-600 mt-1">{validationError}</p>
            )}
            <p className="text-sm text-gray-500">
              Generate a token with 'repo' and 'user' scopes from{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                GitHub Settings
              </a>
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowGitHubTokenModal(false)}
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