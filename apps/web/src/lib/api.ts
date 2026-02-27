const API_BASE = '/api';

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = localStorage.getItem('urja_token');

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Request failed');
    }

    return json.data as T;
}

export const api = {
    // Auth
    register: (email: string, password: string, fullName?: string) =>
        request<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName }),
        }),

    login: (email: string, password: string) =>
        request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    // Onboarding
    submitStep: (step: number, data: any) =>
        request(`/onboard/step/${step}`, { method: 'POST', body: JSON.stringify(data) }),

    getOnboardingStatus: () =>
        request<{ complete: boolean; step: number }>('/onboard/resume'),

    // Plans
    generatePlan: (planType: string) =>
        request('/plans/generate', { method: 'POST', body: JSON.stringify({ planType }) }),

    getCurrentPlan: () => request<any>('/plans/current'),

    getPlanHistory: () => request<any[]>('/plans/history'),

    // Logging
    logWorkout: (data: any) =>
        request('/log/workout', { method: 'POST', body: JSON.stringify(data) }),

    logNutrition: (data: any) =>
        request('/log/nutrition', { method: 'POST', body: JSON.stringify(data) }),

    getWorkoutLogs: (days = 7) =>
        request<any[]>(`/log/workout?days=${days}`),

    getNutritionLogs: (days = 7) =>
        request<any[]>(`/log/nutrition?days=${days}`),

    batchSync: (data: any) =>
        request('/log/batch', { method: 'POST', body: JSON.stringify(data) }),

    // Coaching
    submitCheckIn: (data: any) =>
        request('/coaching/checkin', { method: 'POST', body: JSON.stringify(data) }),

    getCoachMessages: (limit = 20) =>
        request<any[]>(`/coaching/messages?limit=${limit}`),

    askCoach: (question: string) =>
        request('/coaching/chat', { method: 'POST', body: JSON.stringify({ question }) }),

    // Progress
    getMetrics: () => request<any>('/progress/metrics'),

    getBodyTrend: () => request<any[]>('/progress/body'),

    getAdherence: (weeks = 12) =>
        request<any[]>(`/progress/adherence?weeks=${weeks}`),

    getHeatmap: (days = 365) =>
        request<Record<string, number>>(`/progress/heatmap?days=${days}`),

    getMilestones: () => request<any[]>('/progress/milestones'),

    // Privacy
    exportData: () => request<any>('/privacy/export'),

    deleteAccount: () =>
        request('/privacy/delete', { method: 'DELETE' }),

    updateConsent: (data: any) =>
        request('/privacy/consent', { method: 'PUT', body: JSON.stringify(data) }),

    getDataPassport: () => request<any>('/privacy/passport'),
};
