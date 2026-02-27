import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useUIStore } from '../stores';
import { Brain, Send, MessageCircle, BatteryCharging, Moon, Sun, BookOpen } from 'lucide-react';

export default function CoachPage() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [chatReply, setChatReply] = useState('');
    const [loading, setLoading] = useState(false);
    const showToast = useUIStore((s) => s.showToast);

    useEffect(() => {
        api.getCoachMessages(20).then(setMessages).catch(() => { });
    }, []);

    const handleAsk = async () => {
        if (!question.trim()) return;
        setLoading(true);
        try {
            const answer = await api.askCoach(question);
            setChatReply(typeof answer === 'string' ? answer : JSON.stringify(answer));
            setQuestion('');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
        setLoading(false);
    };

    // Quick check-in
    const [checkIn, setCheckIn] = useState({ energyLevel: 3, mood: 3, sleepHours: 7, stressLevel: 2, examWeek: false });
    const [checkInResult, setCheckInResult] = useState<any>(null);

    const handleCheckIn = async () => {
        try {
            const result = await api.submitCheckIn(checkIn);
            setCheckInResult(result);
            showToast('Check-in saved! ✓', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="page">
            <h1 className="text-display mb-6 animate-slide-up">Coach</h1>

            {/* Daily Check-In */}
            <div className="glass-card p-6 mb-6 animate-slide-up">
                <h2 className="text-heading flex items-center gap-2 mb-4">
                    <BatteryCharging size={20} className="text-accent-primary" />
                    Daily Check-In
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="macro-label flex items-center gap-1 mb-1"><Sun size={12} /> Energy</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setCheckIn({ ...checkIn, energyLevel: n })} className={`w-9 h-9 rounded-full text-sm ${n <= checkIn.energyLevel ? 'bg-accent-primary text-surface-900' : 'bg-glass-light text-white/30'}`}>{n}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="macro-label flex items-center gap-1 mb-1"><Moon size={12} /> Mood</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setCheckIn({ ...checkIn, mood: n })} className={`w-9 h-9 rounded-full text-sm ${n <= checkIn.mood ? 'bg-accent-secondary text-surface-900' : 'bg-glass-light text-white/30'}`}>{n}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="macro-label mb-1 block">Sleep (hrs)</label>
                        <input type="number" value={checkIn.sleepHours} onChange={(e) => setCheckIn({ ...checkIn, sleepHours: +e.target.value })} className="input-glass text-center" min={0} max={24} />
                    </div>
                    <div>
                        <label className="macro-label mb-1 block">Stress</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} onClick={() => setCheckIn({ ...checkIn, stressLevel: n })} className={`w-9 h-9 rounded-full text-sm ${n <= checkIn.stressLevel ? 'bg-accent-warm text-surface-900' : 'bg-glass-light text-white/30'}`}>{n}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <label className="flex items-center gap-3 glass-card p-3 mb-4 cursor-pointer">
                    <input type="checkbox" checked={checkIn.examWeek} onChange={(e) => setCheckIn({ ...checkIn, examWeek: e.target.checked })} className="accent-accent-warm" />
                    <span className="text-sm flex items-center gap-1"><BookOpen size={14} /> Exam week</span>
                </label>

                <button onClick={handleCheckIn} className="btn-primary w-full">Submit Check-in</button>

                {checkInResult?.adapted && (
                    <div className="mt-4 p-4 bg-accent-warm/10 rounded-card border border-accent-warm/20 animate-slide-up">
                        <p className="text-sm font-medium text-accent-warm mb-1">⚡ Plan Adapted</p>
                        {checkInResult.triggers?.map((t: any, i: number) => (
                            <p key={i} className="text-sm text-white/60">• {t.reason}</p>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Chat */}
            <div className="glass-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-heading flex items-center gap-2 mb-4">
                    <Brain size={20} className="text-accent-secondary" />
                    Ask Urja Coach
                </h2>

                {chatReply && (
                    <div className="p-4 bg-glass-light rounded-card mb-4 animate-fade-in">
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{chatReply}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        className="input-glass flex-1"
                        placeholder="Ask about your plan, nutrition, or progress..."
                    />
                    <button onClick={handleAsk} disabled={loading || !question.trim()} className="btn-primary px-4">
                        {loading ? '...' : <Send size={16} />}
                    </button>
                </div>
            </div>

            {/* Message History */}
            {messages.length > 0 && (
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="text-sm font-medium text-white/50 flex items-center gap-2">
                        <MessageCircle size={14} /> Recent Messages
                    </h3>
                    {messages.map((msg, i) => (
                        <div key={i} className="glass-card p-3">
                            <p className="text-micro text-accent-muted mb-1">{msg.type} • {new Date(msg.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-white/70">{msg.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
