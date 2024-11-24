import { InstanceType } from '../types/memory';

export const INSTANCE_TYPES: {
  type: InstanceType;
  label: string;
  color: string;
  description: string;
}[] = [
  {
    type: 'bolt',
    label: 'Bolt Assistant',
    color: 'bg-purple-500',
    description: 'StackBlitz Bolt AI Assistant'
  },
  {
    type: 'chatgpt',
    label: 'ChatGPT',
    color: 'bg-green-500',
    description: 'OpenAI ChatGPT Instance'
  },
  {
    type: 'assistant',
    label: 'OpenAI Assistant',
    color: 'bg-blue-500',
    description: 'OpenAI Assistant API Instance'
  },
  {
    type: 'character-ai',
    label: 'Character.AI',
    color: 'bg-pink-500',
    description: 'Character.AI Platform Instance'
  }
];