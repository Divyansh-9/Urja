import { useEffect, useState } from 'react';
import { usePlanStore, useUIStore } from '../stores';
import { Dumbbell, UtensilsCrossed, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function PlansPage() {
    const { currentPlan, generating, safetyWarnings, generate, fetchCurrent } = usePlanStore();
    const showToast = useUIStore((s) => s.showToast);
    const [expanded, setExpanded] = useState<number | null>(0);

    useEffect(() => { fetchCurrent(); }, [fetchCurrent]);

    const handleGenerate = async (type: string) => {
        try {
            await generate(type);
            showToast('Plan generated successfully! 🎉', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const plan = currentPlan?.data || currentPlan?.plan;

    return (
        <div className="page">
            <div className="flex items-center justify-between mb-8 animate-slide-up">
                <h1 className="text-display">Plans</h1>
                <div className="flex gap-2">
                    <button onClick={() => handleGenerate('workout')} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
                        <Dumbbell size={16} />
                        {generating ? 'Generating...' : 'Workout'}
                    </button>
                    <button onClick={() => handleGenerate('nutrition')} disabled={generating} className="btn-secondary flex items-center gap-2 text-sm">
                        <UtensilsCrossed size={16} />
                        Nutrition
                    </button>
                </div>
            </div>

            {/* Safety Warnings */}
            {safetyWarnings.length > 0 && (
                <div className="glass-card p-4 mb-6 border-accent-warm/30 animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-accent-warm" />
                        <span className="text-sm font-medium text-accent-warm">Safety Adjustments Applied</span>
                    </div>
                    {safetyWarnings.map((w: any, i: number) => (
                        <p key={i} className="text-sm text-white/60 ml-6">• {w.message}</p>
                    ))}
                </div>
            )}

            {/* Generating State */}
            {generating && (
                <div className="glass-card p-12 text-center animate-pulse-soft">
                    <Sparkles size={32} className="text-accent-primary mx-auto mb-4" />
                    <p className="text-heading mb-2">Generating Your Plan</p>
                    <p className="text-sm text-white/50">AI is crafting a personalized plan based on your profile, goals, and constraints...</p>
                </div>
            )}

            {/* Plan Display */}
            {plan && !generating && (
                <div className="space-y-3 animate-slide-up">
                    {plan.days?.map((day: any, i: number) => (
                        <div key={i} className="glass-card overflow-hidden">
                            <button
                                onClick={() => setExpanded(expanded === i ? null : i)}
                                className="w-full p-4 flex items-center justify-between hover:bg-glass-medium transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${day.sessionType === 'rest' ? 'bg-accent-muted/20 text-accent-muted' : 'bg-accent-primary/20 text-accent-primary'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium">{day.dayName || `Day ${i + 1}`}</p>
                                        <p className="text-micro text-white/40">{day.sessionType} • {day.durationMins}min</p>
                                    </div>
                                </div>
                                {expanded === i ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                            </button>

                            {expanded === i && (
                                <div className="px-4 pb-4 border-t border-glass-border animate-fade-in">
                                    {/* Warmup */}
                                    {day.warmup?.length > 0 && (
                                        <div className="py-3 border-b border-glass-border">
                                            <p className="macro-label mb-1">Warmup</p>
                                            <p className="text-sm text-white/60">{day.warmup.join(' → ')}</p>
                                        </div>
                                    )}

                                    {/* Exercises */}
                                    <div className="py-3 space-y-2">
                                        {day.exercises?.map((ex: any, j: number) => (
                                            <div key={j} className="flex items-center justify-between p-3 bg-glass-light rounded-card">
                                                <div>
                                                    <p className="text-sm font-medium">{ex.exerciseId}</p>
                                                    {ex.notes && <p className="text-micro text-white/40">{ex.notes}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-mono text-accent-primary">{ex.sets} × {ex.repsMin}–{ex.repsMax}</p>
                                                    <p className="text-micro text-white/30">Rest {ex.restSeconds}s</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cooldown */}
                                    {day.cooldown?.length > 0 && (
                                        <div className="pt-3 border-t border-glass-border">
                                            <p className="macro-label mb-1">Cooldown</p>
                                            <p className="text-sm text-white/60">{day.cooldown.join(' → ')}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Coach Note */}
                    {plan.coachNote && (
                        <div className="glass-card p-4 border-accent-secondary/20">
                            <p className="text-micro text-accent-secondary mb-1">Coach's Note</p>
                            <p className="text-sm text-white/70">{plan.coachNote}</p>
                        </div>
                    )}
                </div>
            )}

            {!plan && !generating && (
                <div className="text-center py-16">
                    <p className="text-white/40">No plan yet. Generate your first plan above.</p>
                </div>
            )}
        </div>
    );
}
