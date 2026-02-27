import { useEffect } from 'react';
import { useProgressStore, usePlanStore } from '../stores';
import { Flame, Dumbbell, Utensils, Brain, TrendingUp, Trophy } from 'lucide-react';

export default function DashboardPage() {
    const { metrics, fetchAll, loading } = useProgressStore();
    const { currentPlan, fetchCurrent } = usePlanStore();

    useEffect(() => {
        fetchAll();
        fetchCurrent();
    }, [fetchAll, fetchCurrent]);

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="page">
            {/* Header */}
            <div className="mb-8 animate-slide-up">
                <p className="text-micro text-accent-primary mb-1">{today}</p>
                <h1 className="text-display">Dashboard</h1>
                <p className="text-body text-white/50 mt-1">Your fitness journey at a glance</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <StatCard
                    icon={<Dumbbell size={18} />}
                    label="Workouts"
                    value={metrics?.totalWorkouts ?? '—'}
                    color="mint"
                />
                <StatCard
                    icon={<Utensils size={18} />}
                    label="Meals Logged"
                    value={metrics?.totalNutritionLogs ?? '—'}
                    color="cyan"
                />
                <StatCard
                    icon={<Flame size={18} />}
                    label="Streak"
                    value={`${metrics?.streaks?.workoutStreak ?? 0}d`}
                    color="warm"
                />
                <StatCard
                    icon={<TrendingUp size={18} />}
                    label="Adherence"
                    value={`${metrics?.adherenceRate ?? 0}%`}
                    color="mint"
                />
            </div>

            {/* Today's Plan */}
            <div className="glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-heading flex items-center gap-2">
                        <Brain size={20} className="text-accent-secondary" />
                        Today's Plan
                    </h2>
                    {currentPlan && (
                        <span className="text-micro px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-pill">
                            Week {currentPlan?.data?.weekNumber || 1}
                        </span>
                    )}
                </div>

                {currentPlan ? (
                    <div className="space-y-3">
                        {currentPlan?.data?.days?.slice(0, 1).map((day: any, i: number) => (
                            <div key={i} className="p-4 bg-glass-light rounded-card border border-glass-border">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{day.dayName || `Day ${i + 1}`}</span>
                                    <span className="text-micro text-white/40">{day.durationMins}min • {day.sessionType}</span>
                                </div>
                                <div className="space-y-1.5">
                                    {day.exercises?.slice(0, 4).map((ex: any, j: number) => (
                                        <div key={j} className="flex justify-between text-sm text-white/60">
                                            <span>{ex.exerciseId}</span>
                                            <span className="text-white/40">{ex.sets} × {ex.repsMin}-{ex.repsMax}</span>
                                        </div>
                                    ))}
                                    {day.exercises?.length > 4 && (
                                        <p className="text-micro text-white/30">+{day.exercises.length - 4} more exercises</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-white/40">
                        <p className="text-sm mb-3">No plan generated yet</p>
                        <a href="/plans" className="btn-primary inline-block">Generate Your First Plan</a>
                    </div>
                )}
            </div>

            {/* Milestones */}
            {metrics?.streaks?.workoutStreak > 0 && (
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-heading flex items-center gap-2 mb-4">
                        <Trophy size={20} className="text-accent-warm" />
                        Current Streak
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-accent-primary">{metrics.streaks.workoutStreak}</p>
                            <p className="text-micro text-white/40">days</p>
                        </div>
                        <div className="flex-1 h-2 bg-glass-light rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((metrics.streaks.workoutStreak / 30) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-micro text-white/30">30d goal</span>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 animate-pulse-soft">
                        <p className="text-sm">Loading dashboard...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: 'mint' | 'cyan' | 'warm' }) {
    const colorClasses = {
        mint: 'text-accent-primary shadow-glow-mint',
        cyan: 'text-accent-secondary shadow-glow-cyan',
        warm: 'text-accent-warm shadow-glow-warm',
    };

    return (
        <div className={`glass-card p-4 ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2 text-white/50">
                {icon}
                <span className="text-micro">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
