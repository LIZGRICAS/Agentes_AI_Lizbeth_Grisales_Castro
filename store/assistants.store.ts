
import { create } from 'zustand';
import { AssistantStore, Message } from '../types';

export const useAssistantStore = create<AssistantStore>((set) => ({
  selectedAssistantId: null,
  isModalOpen: false,
  modalMode: 'create',
  chatHistory: {},

  setSelectedAssistantId: (id) => set({ selectedAssistantId: id }),
  
  openModal: (mode, assistantId) => set({ 
    isModalOpen: true, 
    modalMode: mode, 
    selectedAssistantId: assistantId || null 
  }),

  closeModal: () => set({ 
    isModalOpen: false, 
    selectedAssistantId: null 
  }),

  addChatMessage: (assistantId, message) => set((state) => ({
    chatHistory: {
      ...state.chatHistory,
      [assistantId]: [...(state.chatHistory[assistantId] || []), message]
    }
  })),

  clearChat: (assistantId) => set((state) => ({
    chatHistory: {
      ...state.chatHistory,
      [assistantId]: []
    }
  }))
}));
