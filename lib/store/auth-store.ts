import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id: number;
    email: string;
    name: string;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user) => {
                const isAuth = !!user;
                set({ user, isAuthenticated: isAuth });
            },

            login: (user) => {
                set({ user, isAuthenticated: true });
            },

            logout: () => {
                // State'i temizle (cookie backend'de temizlenecek)
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

