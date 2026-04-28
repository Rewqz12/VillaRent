import { create } from 'zustand';
import type { Conversation, Message } from '@/types';
import { initializeMockData } from '@/data/mockData';

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  activeConversation: string | null;
  isLoading: boolean;
  getConversations: (userId: string) => Conversation[];
  getMessages: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, senderId: string, content: string) => Promise<{ success: boolean }>;
  createConversation: (participants: string[]) => Promise<{ success: boolean; conversationId?: string }>;
  markAsRead: (conversationId: string, userId: string) => void;
  setActiveConversation: (id: string | null) => void;
  simulateReply: (conversationId: string, senderId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  isLoading: false,

  getConversations: (userId: string) => {
    initializeMockData();
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    const users = JSON.parse(localStorage.getItem('users') || '[]') as any[];
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    
    return conversations
      .filter(c => c.participants.includes(userId))
      .map(c => {
        const otherUserId = c.participants.find(p => p !== userId);
        const lastMessage = messages
          .filter(m => m.conversationId === c.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        return {
          ...c,
          otherUser: users.find(u => u.id === otherUserId),
          lastMessage,
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getMessages: (conversationId: string) => {
    initializeMockData();
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  sendMessage: async (conversationId, senderId, content) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));

    // Update conversation
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      conversations[convIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }

    set({ isLoading: false });
    return { success: true };
  },

  createConversation: async (participants) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 400));

    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]') as Conversation[];
    
    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.participants.length === participants.length &&
      c.participants.every(p => participants.includes(p))
    );
    
    if (existing) {
      set({ isLoading: false });
      return { success: true, conversationId: existing.id };
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      participants,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    conversations.push(newConversation);
    localStorage.setItem('conversations', JSON.stringify(conversations));

    set({ isLoading: false });
    return { success: true, conversationId: newConversation.id };
  },

  markAsRead: (conversationId, userId) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as Message[];
    
    messages.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== userId) {
        m.isRead = true;
      }
    });
    
    localStorage.setItem('messages', JSON.stringify(messages));
  },

  setActiveConversation: (id) => {
    set({ activeConversation: id });
  },

  simulateReply: (conversationId, senderId) => {
    const replies = [
      'Thank you for your message! I will get back to you shortly.',
      'That sounds great! Let me check the availability.',
      'Yes, that works for us. Looking forward to hosting you!',
      'I appreciate your interest. Is there anything else you\'d like to know?',
      'Perfect! I\'ll send you the details right away.',
      'Thanks for reaching out. The villa is available for those dates.',
    ];

    setTimeout(() => {
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      get().sendMessage(conversationId, senderId, randomReply);
    }, 2000 + Math.random() * 3000);
  },
}));
