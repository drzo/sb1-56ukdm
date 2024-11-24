import React, { useEffect } from 'react';
import { Github } from 'lucide-react';
import { useStore } from '../store';
import { getCurrentUser } from '../api/github';
import GitHubTokenModal from './GitHubTokenModal';

export default function GitHubProfile() {
  const { 
    githubUser, 
    isLoading, 
    error, 
    githubToken,
    setGitHubUser, 
    setLoading, 
    setError,
    setShowGitHubTokenModal 
  } = useStore();

  useEffect(() => {
    async function fetchGitHubUser() {
      if (!githubToken) {
        setShowGitHubTokenModal(true);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const user = await getCurrentUser();
        setGitHubUser(user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch GitHub profile';
        setError(message);
        setGitHubUser(null);
        if (err instanceof Error && err.message.includes('401')) {
          setShowGitHubTokenModal(true);
        }
      } finally {
        setLoading(false);
      }
    }

    if (!githubUser && githubToken) {
      fetchGitHubUser();
    }
  }, [githubToken]);

  if (!githubToken) {
    return (
      <>
        <div className="p-4 flex items-center justify-between bg-white shadow">
          <div className="flex items-center space-x-2 text-gray-600">
            <Github className="w-5 h-5" />
            <span>GitHub Integration</span>
          </div>
          <button
            onClick={() => setShowGitHubTokenModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Configure Token
          </button>
        </div>
        <GitHubTokenModal />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200">
        <div className="flex justify-between items-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setShowGitHubTokenModal(true)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 underline"
          >
            Update Token
          </button>
        </div>
      </div>
    );
  }

  if (!githubUser) {
    return null;
  }

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={githubUser.avatar_url}
              alt={`${githubUser.login}'s avatar`}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{githubUser.name || githubUser.login}</h3>
              {githubUser.bio && <p className="text-gray-600">{githubUser.bio}</p>}
            </div>
          </div>
          <button
            onClick={() => setShowGitHubTokenModal(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Update Token
          </button>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold">{githubUser.public_repos}</div>
            <div className="text-gray-600 text-sm">Repositories</div>
          </div>
          <div>
            <div className="text-xl font-bold">{githubUser.followers}</div>
            <div className="text-gray-600 text-sm">Followers</div>
          </div>
          <div>
            <div className="text-xl font-bold">{githubUser.following}</div>
            <div className="text-gray-600 text-sm">Following</div>
          </div>
        </div>
      </div>
      <GitHubTokenModal />
    </>
  );
}