import { create } from 'zustand';

interface UserData {
    uid: string;
    email: string | null;
    name: string | null;
    role: 'admin' | 'manager' | 'analyst';
    accessAll: boolean;
    allowedProjects: string[];
}

interface AuthState {
    user: UserData | null;
    loading: boolean;
    setUser: (user: UserData | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
}));
