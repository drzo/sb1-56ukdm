import { db } from '../core';
import { ChatHistoryEntry } from '../../../types';
import { validateChatEntry } from '../validation';

export async function getChatHistory(): Promise<ChatHistoryEntry[]> {
  await db.initialize();
  return db.getDb().chatHistory;
}

export async function addChatEntry(entry: Omit<ChatHistoryEntry, 'id' | 'timestamp'>): Promise<ChatHistoryEntry> {
  await db.initialize();
  const validation = validateChatEntry(entry);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newEntry: ChatHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.chatHistory.push(newEntry);
  await db.saveDb(dbState);
  return newEntry;
}