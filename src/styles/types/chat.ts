export interface ChatHistoryEntry {
  id: string;
  content: string;
  summary?: string;
  recursive_summary?: string;
  timestamp: string;
}

export interface ChatSummary {
  id: string;
  entries: string[];
  summary: string;
  created_at: string;
  updated_at: string;
}