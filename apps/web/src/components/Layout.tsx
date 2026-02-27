import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, UtensilsCrossed, Brain, TrendingUp, Settings } from 'lucide-react';
import { useUIStore } from '../stores';

const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/plans', icon: Dumbbell, label: 'Plans' },
    { to: '/log', icon: UtensilsCrossed, label: 'Log' },
    { to: '/coach', icon: Brain, label: 'Coach' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
    const toast = useUIStore((s) => s.toast);

    return (
        <div className="relative min-h-screen">
            {/* Main Content */}
            <main className="pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-900/80 backdrop-blur-[20px] border-t border-glass-border safe-area-pb">
                <div className="flex justify-around items-center max-w-lg mx-auto px-2 py-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) => isActive ? 'nav-tab-active' : 'nav-tab'}
                        >
                            <Icon size={20} strokeWidth={1.5} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-pill animate-slide-up ${toast.type === 'error' ? 'bg-accent-danger/90' :
                        toast.type === 'success' ? 'bg-accent-primary/90 text-surface-900' :
                            'bg-surface-600/90'
                    } text-sm font-medium backdrop-blur-lg shadow-glass`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
