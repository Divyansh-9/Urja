import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore, useUIStore } from '../stores';
import { SCOFF_QUESTIONS } from '@fitmind/shared-types';
import { ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';

const STEP_TITLES = [
    '', // 0 unused
    'About You',
    'Your Goals',
    'Health Check',
    'Your Lifestyle',
    'Your Setup',
    'Food & Culture',
];

export default function OnboardingPage() {
    const { currentStep, stepData, setStepData, submitStep, loading } = useOnboardingStore();
    const showToast = useUIStore((s) => s.showToast);
    const navigate = useNavigate();

    const data = stepData[currentStep] || {};
    const update = (field: string, value: any) => {
        setStepData(currentStep, { ...data, [field]: value });
    };

    const handleNext = async () => {
        try {
            const result = await submitStep(currentStep);
            if (result?.complete) {
                showToast('Welcome to Urja! Your journey begins now ⚡', 'success');
                navigate('/');
            }
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: // Basics
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="macro-label block mb-1.5">Age</label>
                                <input type="number" value={data.age || ''} onChange={(e) => update('age', +e.target.value)} className="input-glass" placeholder="19" min={13} max={100} />
                            </div>
                            <div>
                                <label className="macro-label block mb-1.5">Sex</label>
                                <select value={data.sex || ''} onChange={(e) => update('sex', e.target.value)} className="select-glass">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="macro-label block mb-1.5">Height (cm)</label>
                                <input type="number" value={data.heightCm || ''} onChange={(e) => update('heightCm', +e.target.value)} className="input-glass" placeholder="170" />
                            </div>
                            <div>
                                <label className="macro-label block mb-1.5">Weight (kg)</label>
                                <input type="number" value={data.weightKg || ''} onChange={(e) => update('weightKg', +e.target.value)} className="input-glass" placeholder="65" />
                            </div>
                        </div>
                    </div>
                );

            case 2: // Goals
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="macro-label block mb-2">Primary Goal</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['lose_fat', 'build_muscle', 'maintain', 'improve_endurance', 'flexibility', 'general_health'].map((g) => (
                                    <button key={g} onClick={() => update('primary', g)} className={`p-3 rounded-card text-sm transition-all ${data.primary === g ? 'bg-accent-primary/20 border border-accent-primary/50 text-accent-primary' : 'glass-card hover:bg-glass-medium'}`}>
                                        {g.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="macro-label block mb-1.5">Urgency</label>
                            <select value={data.urgency || 'moderate'} onChange={(e) => update('urgency', e.target.value)} className="select-glass">
                                <option value="slow">Slow & steady</option>
                                <option value="moderate">Moderate</option>
                                <option value="aggressive">Aggressive</option>
                            </select>
                        </div>
                    </div>
                );

            case 3: // Health + SCOFF
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="macro-label block mb-2">Medical Conditions</label>
                            <input type="text" value={data.conditionsStr || ''} onChange={(e) => { update('conditionsStr', e.target.value); update('conditions', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)); }} className="input-glass" placeholder="e.g. asthma, PCOS (comma separated)" />
                        </div>
                        <div>
                            <label className="macro-label block mb-2">Current Medications</label>
                            <input type="text" value={data.medsStr || ''} onChange={(e) => { update('medsStr', e.target.value); update('medications', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)); }} className="input-glass" placeholder="Comma separated" />
                        </div>
                        <div className="glass-card p-4 border-accent-warm/20">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={16} className="text-accent-warm" />
                                <span className="text-sm font-medium">Wellbeing Check</span>
                            </div>
                            <p className="text-micro text-white/50 mb-3">These questions help us keep you safe. Answer honestly — no judgment.</p>
                            {SCOFF_QUESTIONS.map((q, i) => (
                                <label key={i} className="flex items-start gap-3 py-2 cursor-pointer">
                                    <input type="checkbox" checked={data.scoffAnswers?.[i] || false} onChange={(e) => { const arr = [...(data.scoffAnswers || Array(5).fill(false))]; arr[i] = e.target.checked; update('scoffAnswers', arr); }} className="mt-1 accent-accent-primary" />
                                    <span className="text-sm text-white/70">{q}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 4: // Lifestyle
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="macro-label block mb-1.5">Sleep (hrs/day)</label>
                                <input type="number" value={data.sleepHours || ''} onChange={(e) => update('sleepHours', +e.target.value)} className="input-glass" placeholder="7" min={0} max={24} />
                            </div>
                            <div>
                                <label className="macro-label block mb-1.5">Stress Level</label>
                                <select value={data.stressLevel || 2} onChange={(e) => update('stressLevel', +e.target.value)} className="select-glass">
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {['Chill', 'Low', 'Medium', 'High', 'Extreme'][n - 1]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="macro-label block mb-1.5">Workout Days/Week</label>
                                <input type="number" value={data.workoutDaysPerWeek || ''} onChange={(e) => update('workoutDaysPerWeek', +e.target.value)} className="input-glass" placeholder="3" min={0} max={7} />
                            </div>
                            <div>
                                <label className="macro-label block mb-1.5">Session Length (min)</label>
                                <input type="number" value={data.sessionLengthMins || ''} onChange={(e) => update('sessionLengthMins', +e.target.value)} className="input-glass" placeholder="45" min={10} max={180} />
                            </div>
                        </div>
                        <div>
                            <label className="macro-label block mb-1.5">Preferred Workout Time</label>
                            <select value={data.workoutTimePref || 'flexible'} onChange={(e) => update('workoutTimePref', e.target.value)} className="select-glass">
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                                <option value="flexible">Flexible</option>
                            </select>
                        </div>
                    </div>
                );

            case 5: // Equipment
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="macro-label block mb-1.5">Where do you work out?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['hostel', 'home', 'gym', 'outdoor', 'mixed'].map((s) => (
                                    <button key={s} onClick={() => update('setting', s)} className={`p-3 rounded-card text-sm capitalize transition-all ${data.setting === s ? 'bg-accent-primary/20 border border-accent-primary/50 text-accent-primary' : 'glass-card hover:bg-glass-medium'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 glass-card p-3 cursor-pointer">
                                <input type="checkbox" checked={data.gymAccess || false} onChange={(e) => update('gymAccess', e.target.checked)} className="accent-accent-primary" />
                                <span className="text-sm">Gym Access</span>
                            </label>
                            <label className="flex items-center gap-3 glass-card p-3 cursor-pointer">
                                <input type="checkbox" checked={data.hasKitchen || false} onChange={(e) => update('hasKitchen', e.target.checked)} className="accent-accent-primary" />
                                <span className="text-sm">Kitchen Access</span>
                            </label>
                            <label className="flex items-center gap-3 glass-card p-3 cursor-pointer">
                                <input type="checkbox" checked={data.hasMess ?? true} onChange={(e) => update('hasMess', e.target.checked)} className="accent-accent-primary" />
                                <span className="text-sm">Mess / Canteen</span>
                            </label>
                        </div>
                    </div>
                );

            case 6: // Food & Culture
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="macro-label block mb-1.5">Food Region</label>
                                <select value={data.region || 'north_india'} onChange={(e) => update('region', e.target.value)} className="select-glass">
                                    <option value="north_india">North India</option>
                                    <option value="south_india">South India</option>
                                    <option value="east_india">East India</option>
                                    <option value="west_india">West India</option>
                                    <option value="global">Global / Mixed</option>
                                </select>
                            </div>
                            <div>
                                <label className="macro-label block mb-1.5">Diet Type</label>
                                <select value={data.dietType || 'vegetarian'} onChange={(e) => update('dietType', e.target.value)} className="select-glass">
                                    <option value="omnivore">Non-Veg</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="eggetarian">Eggetarian</option>
                                    <option value="jain">Jain</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="macro-label block mb-1.5">Daily Food Budget (₹)</label>
                            <input type="number" value={data.dailyFoodBudget || ''} onChange={(e) => update('dailyFoodBudget', +e.target.value)} className="input-glass" placeholder="150" />
                        </div>
                        <div>
                            <label className="macro-label block mb-1.5">Allergies</label>
                            <input type="text" value={data.allergiesStr || ''} onChange={(e) => { update('allergiesStr', e.target.value); update('allergies', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)); }} className="input-glass" placeholder="e.g. peanuts, lactose (comma separated)" />
                        </div>
                        <div>
                            <label className="macro-label block mb-1.5">Cooking Skill</label>
                            <select value={data.cookingSkill || 'none'} onChange={(e) => update('cookingSkill', e.target.value)} className="select-glass">
                                <option value="none">None (mess only)</option>
                                <option value="basic">Basic (can boil eggs)</option>
                                <option value="intermediate">Intermediate</option>
                            </select>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-lg animate-slide-up">
                {/* Progress Bar */}
                <div className="flex gap-1.5 mb-8">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s < currentStep ? 'bg-accent-primary' : s === currentStep ? 'bg-accent-primary/60' : 'bg-glass-light'}`} />
                    ))}
                </div>

                {/* Step Title */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-micro text-accent-primary">Step {currentStep} of 6</p>
                        <h2 className="text-heading">{STEP_TITLES[currentStep]}</h2>
                    </div>
                    <span className="text-micro text-white/30">{Math.round((currentStep / 6) * 100)}%</span>
                </div>

                {/* Form */}
                <div className="glass-card p-6 mb-6">
                    {renderStep()}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-between">
                    {currentStep > 1 && (
                        <button onClick={() => useOnboardingStore.setState({ currentStep: currentStep - 1 })} className="btn-secondary flex items-center gap-1">
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}
                    <button onClick={handleNext} disabled={loading} className="btn-primary flex items-center gap-1 ml-auto">
                        {loading ? 'Saving...' : currentStep === 6 ? (
                            <><Check size={16} /> Complete</>
                        ) : (
                            <>Next <ChevronRight size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
