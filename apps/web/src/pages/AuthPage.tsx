import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../stores';
import { Brain, Sparkles } from 'lucide-react';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const { login, register, loading } = useAuthStore();
    const showToast = useUIStore((s) => s.showToast);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password, fullName);
            }
            showToast('Welcome to Urja! ⚡', 'success');
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            <div className="orb-mint" />
            <div className="orb-cyan" />

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-glass bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                        <Brain size={24} className="text-accent-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Urja</h1>
                        <p className="text-micro text-white/40">Your AI Fitness Coach</p>
                    </div>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    {/* Tab Toggle */}
                    <div className="flex gap-1 p-1 bg-glass-light rounded-pill mb-6">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all ${mode === 'login' ? 'bg-accent-primary text-surface-900' : 'text-white/60'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all ${mode === 'register' ? 'bg-accent-primary text-surface-900' : 'text-white/60'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="macro-label block mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="input-glass"
                                    placeholder="Your name"
                                />
                            </div>
                        )}

                        <div>
                            <label className="macro-label block mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-glass"
                                placeholder="you@college.edu"
                                required
                            />
                        </div>

                        <div>
                            <label className="macro-label block mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-glass"
                                placeholder="Min 8 characters"
                                required
                                minLength={8}
                            />
                        </div>

                        {error && (
                            <p className="text-accent-danger text-sm animate-fade-in">{error}</p>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? (
                                <span className="animate-pulse-soft">Authenticating...</span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles size={16} />
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-micro text-white/30 mt-6">
                    Built for Indian college students 🇮🇳
                </p>
            </div>
        </div>
    );
}
