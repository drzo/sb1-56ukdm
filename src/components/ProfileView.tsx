import React from 'react';
import { useStore } from '../store';
import { Github, Bot, Network } from 'lucide-react';
import GitHubTokenModal from './GitHubTokenModal';
import TokenModal from './TokenModal';

export default function ProfileView() {
  const { 
    githubUser, 
    assistantId,
    setShowGitHubTokenModal,
    setShowOpenAITokenModal
  } = useStore();

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Deep Tree Echo Profile</h2>
        
        <div className="space-y-6">
          {/* Character Info */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Bot className="w-12 h-12 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold">Deep Tree Echo</h3>
                <p className="text-gray-600 mt-1">
                  A dynamic neural architecture leveraging hierarchical reservoirs and adaptive 
                  partitioning for optimized cognitive processing.
                </p>
              </div>
            </div>
          </section>

          {/* GitHub Integration */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Github className="w-6 h-6" />
                <h3 className="text-lg font-semibold">GitHub Integration</h3>
              </div>
              <button
                onClick={() => setShowGitHubTokenModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {githubUser ? 'Update Token' : 'Connect GitHub'}
              </button>
            </div>
            
            {githubUser ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={githubUser.avatar_url}
                    alt={`${githubUser.login}'s avatar`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{githubUser.name || githubUser.login}</h4>
                    <p className="text-gray-600">{githubUser.bio}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 bg-white rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{githubUser.public_repos}</div>
                    <div className="text-sm text-gray-600">Repositories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{githubUser.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{githubUser.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                Connect your GitHub account to enable repository integration and collaboration features.
              </div>
            )}
          </section>

          {/* OpenAI Integration */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Network className="w-6 h-6" />
                <h3 className="text-lg font-semibold">OpenAI Integration</h3>
              </div>
              <button
                onClick={() => setShowOpenAITokenModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {assistantId ? 'Update Token' : 'Configure API'}
              </button>
            </div>
            
            {assistantId ? (
              <div className="space-y-2">
                <p className="text-green-600">Assistant configured and ready</p>
                <p className="text-sm text-gray-600">
                  Using GPT-4 Turbo for enhanced cognitive processing
                </p>
              </div>
            ) : (
              <div className="text-gray-600">
                Configure your OpenAI API key to enable advanced cognitive capabilities.
              </div>
            )}
          </section>
        </div>
      </div>

      <GitHubTokenModal />
      <TokenModal />
    </div>
  );
}