import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { initializeMockData } from '@/data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        initializeMockData();
        const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          set({ isLoading: false });
          return { success: false, error: 'User not found' };
        }
        
        if (!user.isActive) {
          set({ isLoading: false });
          return { success: false, error: 'Account is suspended' };
        }
        
        // Mock password check (in real app, this would be hashed)
        if (password.length < 6) {
          set({ isLoading: false });
          return { success: false, error: 'Invalid password' };
        }
        
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      signup: async (name: string, email: string, _password: string, role: UserRole) => {
        set({ isLoading: true });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        initializeMockData();
        const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
        
        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          set({ isLoading: false });
          return { success: false, error: 'Email already registered' };
        }
        
        // In a real app, password would be hashed and stored
        // _password is received but not stored (mock auth)
        
        const newUser: User = {
          id: `user_${Date.now()}`,
          email,
          name,
          role,
          avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        const updatedUser = { ...user, ...userData };
        set({ user: updatedUser });
        
        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          users[index] = updatedUser;
          localStorage.setItem('users', JSON.stringify(users));
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
