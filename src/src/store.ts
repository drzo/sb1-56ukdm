import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ViewType, AtomSpaceData } from './types';
import { GitHubUser } from './types/github';

interface State {
  messages: Message[];
  currentView: ViewType;
  atomSpace: AtomSpaceData | null;
  githubUser: GitHubUser | null;
  isLoading: boolean;
  error: string | null;
  showGitHubTokenModal: boolean;
  showOpenAITokenModal: boolean;
  githubToken: string | null;
  openaiToken: string | null;
  assistantId: string | null;
  threadId: string | null;
  browserWindow: Window | null;
  addMessage: (message: Message) => void;
  setView: (view: ViewType) => void;
  setAtomSpace: (data: AtomSpaceData) => void;
  setGitHubUser: (user: GitHubUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowGitHubTokenModal: (show: boolean) => void;
  setShowOpenAITokenModal: (show: boolean) => void;
  setGitHubToken: (token: string | null) => void;
  setOpenAIToken: (token: string | null) => void;
  setAssistantId: (id: string | null) => void;
  setThreadId: (id: string | null) => void;
  setBrowserWindow: (window: Window | null) => void;
  clearTokens: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      messages: [],
      currentView: 'profile',
      atomSpace: null,
      githubUser: null,
      isLoading: false,
      error: null,
      showGitHubTokenModal: false,
      showOpenAITokenModal: false,
      githubToken: null,
      openaiToken: null,
      assistantId: null,
      threadId: null,
      browserWindow: null,
      addMessage: (message) => set((state) => ({
        messages: [...(state.messages || []), message]
      })),
      setView: (view) => set({ currentView: view }),
      setAtomSpace: (data) => set({ atomSpace: data }),
      setGitHubUser: (user) => set({ githubUser: user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setShowGitHubTokenModal: (show) => set({ showGitHubTokenModal: show }),
      setShowOpenAITokenModal: (show) => set({ showOpenAITokenModal: show }),
      setGitHubToken: (token) => set({ githubToken: token }),
      setOpenAIToken: (token) => set({ openaiToken: token }),
      setAssistantId: (id) => set({ assistantId: id }),
      setThreadId: (id) => set({ threadId: id }),
      setBrowserWindow: (window) => set({ browserWindow: window }),
      clearTokens: () => set({
        githubToken: null,
        openaiToken: null,
        assistantId: null,
        threadId: null,
        githubUser: null
      })
    }),
    {
      name: 'deep-tree-echo-storage',
      partialize: (state) => ({
        githubToken: state.githubToken,
        openaiToken: state.openaiToken,
        assistantId: state.assistantId,
        threadId: state.threadId,
        githubUser: state.githubUser,
        messages: state.messages
      })
    }
  )
);