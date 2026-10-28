import { create } from 'zustand';
import { User } from '@/types';
import { storage } from '@/utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setSession: (user: User, token: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  loadSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const KEY = 'event_app_session';

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  setSession: async (user, token) => {
    await storage.set(KEY, JSON.stringify({ user, token }));
    set({ user, token });
  },
  updateUser: async (user) => {
    const token = get().token;
    if (token) await storage.set(KEY, JSON.stringify({ user, token }));
    set({ user });
  },
  loadSession: async () => {
    const raw = await storage.get(KEY);
    if (raw) {
      try {
        const { user, token } = JSON.parse(raw);
        set({ user, token });
      } catch {}
    }
    set({ isLoading: false });
  },
  logout: async () => {
    await storage.remove(KEY);
    set({ user: null, token: null });
  },
}));
