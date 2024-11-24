import OpenAI from 'openai';
import { useAssistantStore } from '../store/assistantStore';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function fetchAssistants() {
  try {
    const assistantsList = await openai.beta.assistants.list();
    return assistantsList.data.map(assistant => ({
      id: assistant.id,
      name: assistant.name || 'Unnamed Assistant',
      model: assistant.model,
      instructions: assistant.instructions,
      lastSync: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching assistants:', error);
    throw error;
  }
}

export async function startAssistantChat(assistantId: string) {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating chat thread:', error);
    throw error;
  }
}

export async function sendMessageToAssistant(threadId: string, assistantId: string, content: string) {
  try {
    // Add the user's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });

    // Wait for the completion
    let response = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (response.status === 'in_progress' || response.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      response = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Get the assistant's messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];

    return lastMessage.content[0].text.value;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}