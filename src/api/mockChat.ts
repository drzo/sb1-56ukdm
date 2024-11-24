import { Message } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function sendChatMessage(message: string): Promise<Message> {
  await delay(1000); // Simulate network delay
  
  return {
    role: 'assistant',
    content: `I received your message: "${message}". This is a mock response as the backend is not yet implemented.`
  };
}