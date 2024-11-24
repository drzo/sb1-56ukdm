import { GitHubUser } from '../types/github';
import { useStore } from '../store';

class GitHubAPIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

async function githubFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useStore.getState().githubToken;
  
  if (!token) {
    useStore.getState().setShowGitHubTokenModal(true);
    throw new Error('GitHub token not configured');
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      useStore.getState().setGitHubToken(null);
      useStore.getState().setGitHubUser(null);
      useStore.getState().setShowGitHubTokenModal(true);
    }
    throw new GitHubAPIError(
      `GitHub API error: ${data.message || response.statusText}`,
      response.status
    );
  }

  return response.json();
}

export async function getCurrentUser(): Promise<GitHubUser> {
  return githubFetch<GitHubUser>('/user');
}

export async function getUserRepositories(username: string) {
  return githubFetch<any[]>(`/users/${username}/repos`);
}

export async function getRepository(owner: string, repo: string) {
  return githubFetch<any>(`/repos/${owner}/${repo}`);
}