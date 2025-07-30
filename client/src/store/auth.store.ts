import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState } from '../types/auth.types';
import type { User } from '../types/auth.types';

export const useAuthStore = create<
    AuthState & {
        setUser: (user: User | null) => void;
        setIsAuthenticated: (isAuthenticated: boolean) => void;
        setIsLoading: (isLoading: boolean) => void;
        setPharmacyConfigured: (isConfigured: boolean) => void;
        clearAuth: () => void;
    }
>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            isPharmacyConfigured: false,

            setUser: (user) => set({ user }),
            setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setPharmacyConfigured: (isConfigured) =>
                set({ isPharmacyConfigured: isConfigured }),
            clearAuth: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
