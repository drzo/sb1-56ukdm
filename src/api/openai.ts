import OpenAI from 'openai';
import { useStore } from '../store';
import { addAssistantInstance } from '../utils/db';
import { AssistantInstance } from '../types/memory';

let openai: OpenAI | null = null;

export async function initializeAssistant() {
  const token = useStore.getState().openaiToken;
  
  if (!token) {
    throw new Error('OpenAI token not configured');
  }

  openai = new OpenAI({
    apiKey: token,
    dangerouslyAllowBrowser: true
  });
}

export async function sendMessage(content: string): Promise<string> {
  const token = useStore.getState().openaiToken;
  const assistantId = useStore.getState().assistantId;
  
  if (!token) {
    throw new Error('OpenAI token not configured');
  }

  if (!assistantId) {
    throw new Error('No assistant selected');
  }

  if (!openai) {
    await initializeAssistant();
  }

  try {
    // Create a new thread
    const thread = await openai!.beta.threads.create();

    // Add the user's message to the thread
    await openai!.beta.threads.messages.create(thread.id, {
      role: 'user',
      content
    });

    // Run the assistant
    const run = await openai!.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    // Poll for completion
    let response;
    while (true) {
      const runStatus = await openai!.beta.threads.runs.retrieve(thread.id, run.id);
      if (runStatus.status === 'completed') {
        const messages = await openai!.beta.threads.messages.list(thread.id);
        response = messages.data[0].content[0].text.value;
        break;
      } else if (runStatus.status === 'failed') {
        throw new Error('Assistant failed to process the message');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function retrieveAssistants(): Promise<AssistantInstance[]> {
  const token = useStore.getState().openaiToken;
  
  if (!token) {
    throw new Error('OpenAI token not configured');
  }

  if (!openai) {
    await initializeAssistant();
  }

  try {
    const assistants = await openai!.beta.assistants.list({
      limit: 100,
      order: 'desc'
    });

    const instances: AssistantInstance[] = [];
    
    for (const assistant of assistants.data) {
      try {
        let type: 'production' | 'development' | 'orchestrator' = 'development';
        
        if (assistant.name?.toLowerCase().includes('orchestrator')) {
          type = 'orchestrator';
        } else if (assistant.name?.toLowerCase().includes('production')) {
          type = 'production';
        }

        const instance = await addAssistantInstance({
          name: assistant.name || 'Unnamed Assistant',
          type,
          assistantId: assistant.id,
          systemPrompt: assistant.instructions || ''
        });

        instances.push(instance);
      } catch (error) {
        console.error(`Failed to save assistant instance ${assistant.id}:`, error);
      }
    }

    if (instances.length === 0) {
      throw new Error('No assistant instances could be saved');
    }

    return instances;
  } catch (error) {
    console.error('Failed to retrieve assistants:', error);
    throw error;
  }
}