import { useEffect } from 'react';
import { useProgressStore } from '../stores';
import { TrendingUp, Flame, Calendar, Trophy } from 'lucide-react';

export default function ProgressPage() {
    const { metrics, bodyTrend, adherence, heatmap, milestones, loading, fetchAll } = useProgressStore();

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const heatmapData = Object.entries(heatmap).sort(([a], [b]) => a.localeCompare(b));

    return (
        <div className="page">
            <h1 className="text-display mb-6 animate-slide-up">Progress</h1>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-slide-up">
                <div className="glass-card p-4">
                    <p className="macro-label mb-1">Total Workouts</p>
                    <p className="text-2xl font-bold text-accent-primary">{metrics?.totalWorkouts ?? 0}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="macro-label mb-1">This Week</p>
                    <p className="text-2xl font-bold text-accent-secondary">{metrics?.adherenceRate ?? 0}%</p>
                </div>
                <div className="glass-card p-4">
                    <p className="macro-label mb-1">Current Streak</p>
                    <p className="text-2xl font-bold text-accent-warm">{metrics?.streaks?.workoutStreak ?? 0}d</p>
                </div>
                <div className="glass-card p-4">
                    <p className="macro-label mb-1">Longest Streak</p>
                    <p className="text-2xl font-bold text-white/60">{metrics?.streaks?.longestWorkoutStreak ?? 0}d</p>
                </div>
            </div>

            {/* Weight Trend */}
            {bodyTrend.length > 0 && (
                <div className="glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-heading flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-accent-primary" />
                        Weight Trend
                    </h2>
                    <div className="flex items-end gap-1 h-32">
                        {bodyTrend.slice(-30).map((p, i) => {
                            const min = Math.min(...bodyTrend.map((t) => t.weightKg || 0));
                            const max = Math.max(...bodyTrend.map((t) => t.weightKg || 1));
                            const range = max - min || 1;
                            const height = ((p.weightKg - min) / range) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-accent-primary/40 rounded-sm hover:bg-accent-primary/70 transition-colors"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                        title={`${p.weightKg}kg — ${p.date}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-micro text-white/30">
                        <span>{bodyTrend[0]?.date}</span>
                        <span>{bodyTrend[bodyTrend.length - 1]?.date}</span>
                    </div>
                </div>
            )}

            {/* Workout Heatmap */}
            {heatmapData.length > 0 && (
                <div className="glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-heading flex items-center gap-2 mb-4">
                        <Calendar size={20} className="text-accent-secondary" />
                        Workout Heatmap
                    </h2>
                    <div className="flex flex-wrap gap-[3px]">
                        {heatmapData.map(([day, count]) => (
                            <div
                                key={day}
                                className="w-3 h-3 rounded-sm transition-colors"
                                style={{
                                    backgroundColor:
                                        count === 0 ? 'rgba(255,255,255,0.05)' :
                                            count === 1 ? 'rgba(0, 229, 160, 0.3)' :
                                                count === 2 ? 'rgba(0, 229, 160, 0.5)' :
                                                    'rgba(0, 229, 160, 0.8)',
                                }}
                                title={`${day}: ${count} workout(s)`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Adherence */}
            {adherence.length > 0 && (
                <div className="glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-heading flex items-center gap-2 mb-4">
                        <Flame size={20} className="text-accent-warm" />
                        Weekly Adherence
                    </h2>
                    <div className="space-y-2">
                        {adherence.slice(-8).map((week, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-micro text-white/40 w-12">W{week.weekNumber}</span>
                                <div className="flex-1 h-3 bg-glass-light rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500"
                                        style={{ width: `${week.workoutAdherence}%` }}
                                    />
                                </div>
                                <span className="text-micro text-white/50 w-10 text-right">{week.workoutAdherence}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-heading flex items-center gap-2 mb-4">
                        <Trophy size={20} className="text-accent-warm" />
                        Milestones
                    </h2>
                    <div className="space-y-3">
                        {milestones.slice(0, 10).map((m, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-glass-light rounded-card">
                                <div className="w-8 h-8 rounded-full bg-accent-warm/20 flex items-center justify-center text-accent-warm">🏆</div>
                                <div>
                                    <p className="text-sm font-medium">{m.title}</p>
                                    <p className="text-micro text-white/40">{m.description} • {new Date(m.achievedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!loading && !metrics && (
                <div className="text-center py-16 text-white/40">
                    <p>Start logging workouts to see your progress here.</p>
                </div>
            )}
        </div>
    );
}
