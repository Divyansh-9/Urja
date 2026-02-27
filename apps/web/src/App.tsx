import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useOnboardingStore } from './stores';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import PlansPage from './pages/PlansPage';
import LogPage from './pages/LogPage';
import CoachPage from './pages/CoachPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    return <>{children}</>;
}

export default function App() {
    const hydrate = useAuthStore((s) => s.hydrate);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const checkOnboarding = useOnboardingStore((s) => s.checkStatus);
    const onboardingComplete = useOnboardingStore((s) => s.complete);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    useEffect(() => {
        if (isAuthenticated) checkOnboarding();
    }, [isAuthenticated, checkOnboarding]);

    return (
        <>
            {/* Ambient orbs */}
            <div className="orb-mint" />
            <div className="orb-cyan" />

            <Routes>
                <Route path="/auth" element={<AuthPage />} />

                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <OnboardingPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    element={
                        <ProtectedRoute>
                            {isAuthenticated && !onboardingComplete ? (
                                <Navigate to="/onboarding" replace />
                            ) : (
                                <Layout />
                            )}
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/plans" element={<PlansPage />} />
                    <Route path="/log" element={<LogPage />} />
                    <Route path="/coach" element={<CoachPage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
