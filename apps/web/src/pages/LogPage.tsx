import { useState } from 'react';
import { useUIStore } from '../stores';
import { api } from '../lib/api';
import { Dumbbell, UtensilsCrossed, Plus, Check } from 'lucide-react';

export default function LogPage() {
    const [tab, setTab] = useState<'workout' | 'nutrition'>('workout');
    const showToast = useUIStore((s) => s.showToast);

    return (
        <div className="page">
            <h1 className="text-display mb-6 animate-slide-up">Log</h1>

            {/* Tab Toggle */}
            <div className="flex gap-1 p-1 bg-glass-light rounded-pill mb-6 max-w-xs animate-slide-up">
                <button
                    onClick={() => setTab('workout')}
                    className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all flex items-center justify-center gap-1.5 ${tab === 'workout' ? 'bg-accent-primary text-surface-900' : 'text-white/60'
                        }`}
                >
                    <Dumbbell size={14} /> Workout
                </button>
                <button
                    onClick={() => setTab('nutrition')}
                    className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all flex items-center justify-center gap-1.5 ${tab === 'nutrition' ? 'bg-accent-primary text-surface-900' : 'text-white/60'
                        }`}
                >
                    <UtensilsCrossed size={14} /> Nutrition
                </button>
            </div>

            {tab === 'workout' ? (
                <WorkoutLogger onToast={showToast} />
            ) : (
                <NutritionLogger onToast={showToast} />
            )}
        </div>
    );
}

function WorkoutLogger({ onToast }: { onToast: (msg: string, type?: any) => void }) {
    const [exercises, setExercises] = useState<Array<{
        exerciseId: string;
        sets: Array<{ reps: number; weightKg: number; completed: boolean }>;
    }>>([]);
    const [energyLevel, setEnergyLevel] = useState(3);
    const [mood, setMood] = useState(3);
    const [duration, setDuration] = useState(45);
    const [saving, setSaving] = useState(false);

    const addExercise = () => {
        setExercises([...exercises, { exerciseId: '', sets: [{ reps: 10, weightKg: 0, completed: false }] }]);
    };

    const addSet = (exIdx: number) => {
        const updated = [...exercises];
        updated[exIdx].sets.push({ reps: 10, weightKg: 0, completed: false });
        setExercises(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.logWorkout({
                exercisesCompleted: exercises,
                energyLevel,
                mood,
                sessionDurationMins: duration,
            });
            onToast('Workout logged! 💪', 'success');
            setExercises([]);
        } catch (err: any) {
            onToast(err.message, 'error');
        }
        setSaving(false);
    };

    return (
        <div className="space-y-4 animate-slide-up">
            {/* Duration + Energy + Mood */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-4">
                    <label className="macro-label block mb-1">Duration</label>
                    <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className="input-glass text-center font-mono" />
                    <p className="text-micro text-white/30 text-center mt-1">minutes</p>
                </div>
                <div className="glass-card p-4">
                    <label className="macro-label block mb-1">Energy</label>
                    <div className="flex justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setEnergyLevel(n)} className={`w-7 h-7 rounded-full text-micro ${n <= energyLevel ? 'bg-accent-primary text-surface-900' : 'bg-glass-light text-white/30'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="glass-card p-4">
                    <label className="macro-label block mb-1">Mood</label>
                    <div className="flex justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setMood(n)} className={`w-7 h-7 rounded-full text-micro ${n <= mood ? 'bg-accent-secondary text-surface-900' : 'bg-glass-light text-white/30'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exercises */}
            {exercises.map((ex, i) => (
                <div key={i} className="glass-card p-4">
                    <input
                        type="text"
                        value={ex.exerciseId}
                        onChange={(e) => { const u = [...exercises]; u[i].exerciseId = e.target.value; setExercises(u); }}
                        className="input-glass mb-3"
                        placeholder="Exercise name"
                    />
                    {ex.sets.map((set, j) => (
                        <div key={j} className="flex items-center gap-2 mb-2">
                            <span className="text-micro text-white/30 w-8">S{j + 1}</span>
                            <input type="number" value={set.reps} onChange={(e) => { const u = [...exercises]; u[i].sets[j].reps = +e.target.value; setExercises(u); }} className="input-glass flex-1 text-center text-sm py-2" placeholder="Reps" />
                            <input type="number" value={set.weightKg || ''} onChange={(e) => { const u = [...exercises]; u[i].sets[j].weightKg = +e.target.value; setExercises(u); }} className="input-glass flex-1 text-center text-sm py-2" placeholder="kg" />
                            <button onClick={() => { const u = [...exercises]; u[i].sets[j].completed = !u[i].sets[j].completed; setExercises(u); }} className={`w-8 h-8 rounded-full flex items-center justify-center ${set.completed ? 'bg-accent-primary text-surface-900' : 'bg-glass-light'}`}>
                                <Check size={14} />
                            </button>
                        </div>
                    ))}
                    <button onClick={() => addSet(i)} className="text-micro text-accent-primary hover:underline">+ Add Set</button>
                </div>
            ))}

            <button onClick={addExercise} className="btn-secondary w-full flex items-center justify-center gap-2">
                <Plus size={16} /> Add Exercise
            </button>

            {exercises.length > 0 && (
                <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                    {saving ? 'Saving...' : 'Save Workout'}
                </button>
            )}
        </div>
    );
}

function NutritionLogger({ onToast }: { onToast: (msg: string, type?: any) => void }) {
    const [meals, setMeals] = useState<Array<{ mealType: string; items: Array<{ foodId: string; servingGrams: number }> }>>([]);
    const [waterMl, setWaterMl] = useState(0);
    const [saving, setSaving] = useState(false);

    const addMeal = (type: string) => {
        setMeals([...meals, { mealType: type, items: [{ foodId: '', servingGrams: 100 }] }]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.logNutrition({ mealsLogged: meals, waterMl });
            onToast('Nutrition logged! 🥗', 'success');
            setMeals([]);
        } catch (err: any) {
            onToast(err.message, 'error');
        }
        setSaving(false);
    };

    return (
        <div className="space-y-4 animate-slide-up">
            {/* Water */}
            <div className="glass-card p-4">
                <label className="macro-label block mb-2">Water Intake</label>
                <div className="flex items-center gap-3">
                    <input type="range" min={0} max={4000} step={250} value={waterMl} onChange={(e) => setWaterMl(+e.target.value)} className="flex-1 accent-accent-secondary" />
                    <span className="text-sm font-mono text-accent-secondary w-16 text-right">{waterMl}ml</span>
                </div>
            </div>

            {/* Meal Buttons */}
            <div className="grid grid-cols-4 gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <button key={type} onClick={() => addMeal(type)} className="glass-card-interactive p-3 text-center">
                        <p className="text-sm capitalize">{type}</p>
                        <p className="text-micro text-white/30">+ Add</p>
                    </button>
                ))}
            </div>

            {/* Meal Cards */}
            {meals.map((meal, i) => (
                <div key={i} className="glass-card p-4">
                    <p className="text-sm font-medium capitalize mb-3">{meal.mealType}</p>
                    {meal.items.map((item, j) => (
                        <div key={j} className="flex gap-2 mb-2">
                            <input type="text" value={item.foodId} onChange={(e) => { const u = [...meals]; u[i].items[j].foodId = e.target.value; setMeals(u); }} className="input-glass flex-1 text-sm py-2" placeholder="Food name" />
                            <input type="number" value={item.servingGrams} onChange={(e) => { const u = [...meals]; u[i].items[j].servingGrams = +e.target.value; setMeals(u); }} className="input-glass w-20 text-center text-sm py-2" placeholder="g" />
                        </div>
                    ))}
                    <button onClick={() => { const u = [...meals]; u[i].items.push({ foodId: '', servingGrams: 100 }); setMeals(u); }} className="text-micro text-accent-primary hover:underline">+ Add Item</button>
                </div>
            ))}

            {meals.length > 0 && (
                <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                    {saving ? 'Saving...' : 'Save Nutrition Log'}
                </button>
            )}
        </div>
    );
}
