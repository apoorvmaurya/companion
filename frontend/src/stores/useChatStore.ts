import { create } from 'zustand';

interface ChatMessage {
  id: string;
  sender_type: 'user' | 'companion';
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearMessages: () => set({ messages: [] })
}));
