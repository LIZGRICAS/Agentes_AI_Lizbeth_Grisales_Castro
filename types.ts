
export type Language = 'Español' | 'Inglés' | 'Portugués';
export type Tone = 'Formal' | 'Casual' | 'Profesional' | 'Amigable';

export interface ResponseLength {
  short: number;
  medium: number;
  long: number;
}

export interface Assistant {
  id: string;
  name: string;
  language: Language;
  tone: Tone;
  responseLength: ResponseLength;
  audioEnabled: boolean;
  rules: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  audioUrl?: string;
}

export interface AssistantStore {
  selectedAssistantId: string | null;
  isModalOpen: boolean;
  modalMode: 'create' | 'edit';
  chatHistory: Record<string, Message[]>;
  setSelectedAssistantId: (id: string | null) => void;
  openModal: (mode: 'create' | 'edit', assistantId?: string) => void;
  closeModal: () => void;
  addChatMessage: (assistantId: string, message: Message) => void;
  clearChat: (assistantId: string) => void;
}
