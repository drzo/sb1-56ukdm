import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Assistant {
  id: string;
  name: string;
  model: string;
  instructions?: string;
  lastSync?: string;
}

interface AssistantMapping {
  characterId: string;
  assistantId: string;
}

interface AssistantStore {
  assistants: Assistant[];
  mappings: AssistantMapping[];
  setAssistants: (assistants: Assistant[]) => void;
  addMapping: (mapping: AssistantMapping) => void;
  removeMapping: (characterId: string) => void;
  getAssistantForCharacter: (characterId: string) => Assistant | undefined;
}

export const useAssistantStore = create<AssistantStore>()(
  persist(
    (set, get) => ({
      assistants: [],
      mappings: [],
      setAssistants: (assistants) => set({ assistants }),
      addMapping: (mapping) => set((state) => ({
        mappings: [
          ...state.mappings.filter(m => m.characterId !== mapping.characterId),
          mapping
        ]
      })),
      removeMapping: (characterId) => set((state) => ({
        mappings: state.mappings.filter(m => m.characterId !== characterId)
      })),
      getAssistantForCharacter: (characterId) => {
        const mapping = get().mappings.find(m => m.characterId === characterId);
        if (!mapping) return undefined;
        return get().assistants.find(a => a.id === mapping.assistantId);
      }
    }),
    {
      name: 'assistant-storage'
    }
  )
);