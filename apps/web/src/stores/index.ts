import { create } from 'zustand';
import { api } from '../lib/api';

// ─── Auth Store ──────────────────────────────────────────────────
interface AuthState {
    user: { id: string; email: string; fullName?: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const { user, token } = await api.login(email, password);
            localStorage.setItem('urja_token', token);
            localStorage.setItem('urja_user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true, loading: false });
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    register: async (email, password, fullName) => {
        set({ loading: true });
        try {
            const { user, token } = await api.register(email, password, fullName);
            localStorage.setItem('urja_token', token);
            localStorage.setItem('urja_user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true, loading: false });
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('urja_token');
        localStorage.removeItem('urja_user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    hydrate: () => {
        const token = localStorage.getItem('urja_token');
        const userStr = localStorage.getItem('urja_user');
        if (token && userStr) {
            set({ user: JSON.parse(userStr), token, isAuthenticated: true });
        }
    },
}));

// ─── Onboarding Store ───────────────────────────────────────────
interface OnboardingState {
    currentStep: number;
    complete: boolean;
    stepData: Record<number, any>;
    loading: boolean;
    setStepData: (step: number, data: any) => void;
    submitStep: (step: number) => Promise<any>;
    checkStatus: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
    currentStep: 1,
    complete: false,
    stepData: {},
    loading: false,

    setStepData: (step, data) => {
        set((s) => ({ stepData: { ...s.stepData, [step]: data } }));
    },

    submitStep: async (step) => {
        set({ loading: true });
        try {
            const data = get().stepData[step];
            const result = await api.submitStep(step, data);
            if (result.complete) {
                set({ complete: true, currentStep: 7, loading: false });
            } else {
                set({ currentStep: result.nextStep, loading: false });
            }
            return result;
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    checkStatus: async () => {
        try {
            const status = await api.getOnboardingStatus();
            set({ complete: status.complete, currentStep: status.step });
        } catch {
            set({ currentStep: 1 });
        }
    },
}));

// ─── Plan Store ─────────────────────────────────────────────────
interface PlanState {
    currentPlan: any | null;
    planHistory: any[];
    generating: boolean;
    safetyWarnings: any[];
    fetchCurrent: () => Promise<void>;
    generate: (type: string) => Promise<void>;
    fetchHistory: () => Promise<void>;
    hydratePlan: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
    currentPlan: null,
    planHistory: [],
    generating: false,
    safetyWarnings: [],

    hydratePlan: () => {
        try {
            const cached = localStorage.getItem('urja_current_plan');
            if (cached) {
                set({ currentPlan: JSON.parse(cached) });
            }
        } catch { /* ignore parse errors */ }
    },

    fetchCurrent: async () => {
        try {
            const plan = await api.getCurrentPlan();
            localStorage.setItem('urja_current_plan', JSON.stringify(plan));
            set({ currentPlan: plan });
        } catch {
            set({ currentPlan: null });
        }
    },

    generate: async (type) => {
        set({ generating: true });
        try {
            const result = await api.generatePlan(type);
            localStorage.setItem('urja_current_plan', JSON.stringify(result));
            set({
                currentPlan: result,
                generating: false,
                safetyWarnings: result.safetyWarnings || [],
            });
        } catch (err) {
            set({ generating: false });
            throw err;
        }
    },

    fetchHistory: async () => {
        const history = await api.getPlanHistory();
        set({ planHistory: history });
    },
}));

// ─── Progress Store ─────────────────────────────────────────────
interface ProgressState {
    metrics: any;
    bodyTrend: any[];
    adherence: any[];
    heatmap: Record<string, number>;
    milestones: any[];
    loading: boolean;
    fetchAll: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
    metrics: null,
    bodyTrend: [],
    adherence: [],
    heatmap: {},
    milestones: [],
    loading: false,

    fetchAll: async () => {
        set({ loading: true });
        try {
            const [metrics, bodyTrend, adherence, heatmap, milestones] = await Promise.all([
                api.getMetrics(),
                api.getBodyTrend(),
                api.getAdherence(),
                api.getHeatmap(),
                api.getMilestones(),
            ]);
            set({ metrics, bodyTrend, adherence, heatmap, milestones, loading: false });
        } catch {
            set({ loading: false });
        }
    },
}));

// ─── UI Store ───────────────────────────────────────────────────
interface UIState {
    sidebarOpen: boolean;
    activeTab: string;
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    toggleSidebar: () => void;
    setTab: (tab: string) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: false,
    activeTab: 'dashboard',
    toast: null,

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setTab: (tab) => set({ activeTab: tab }),
    showToast: (message, type = 'info') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
    },
    clearToast: () => set({ toast: null }),
}));
