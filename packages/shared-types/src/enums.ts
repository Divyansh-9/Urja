// ─── Primitive Types ───────────────────────────────────────────────
export type ISO8601 = string;

// ─── Enums ────────────────────────────────────────────────────────

export type FoodRegion =
    | 'north_india'
    | 'south_india'
    | 'east_india'
    | 'west_india'
    | 'global';

export type DietType =
    | 'omnivore'
    | 'vegetarian'
    | 'vegan'
    | 'eggetarian'
    | 'jain'
    | 'halal'
    | 'kosher';

export type GoalType =
    | 'lose_fat'
    | 'build_muscle'
    | 'maintain'
    | 'improve_endurance'
    | 'flexibility'
    | 'general_health';

export type Urgency = 'slow' | 'moderate' | 'aggressive';

export type SafetyLevel = 'full' | 'modified' | 'medical_only' | 'blocked';

export type EnvironmentSetting = 'hostel' | 'home' | 'gym' | 'outdoor' | 'mixed';

export type WorkoutTimePref = 'morning' | 'afternoon' | 'evening' | 'flexible';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type CookingSkill = 'none' | 'basic' | 'intermediate';

export type NoiseLevel = 'silent' | 'low' | 'normal';

export type SpaceRequired = 'minimal' | 'medium' | 'full';

export type SessionType = 'strength' | 'cardio' | 'mobility' | 'rest';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type PlanType = 'workout' | 'nutrition' | 'combined';

export type PortionSize = 'small' | 'medium' | 'large';

export type RoomType = 'single' | 'shared' | 'dorm';

export type Sex = 'male' | 'female' | 'other';

// ─── Equipment ────────────────────────────────────────────────────

export type Equipment =
    | 'none'
    | 'resistance_bands'
    | 'dumbbells'
    | 'barbell'
    | 'pull_up_bar'
    | 'bench'
    | 'kettlebell'
    | 'yoga_mat'
    | 'jump_rope'
    | 'ab_wheel'
    | 'foam_roller'
    | 'cable_machine'
    | 'smith_machine'
    | 'leg_press'
    | 'treadmill'
    | 'stationary_bike'
    | 'rowing_machine';

// ─── Mess Meal Categories ─────────────────────────────────────────

export type MessMealCategory =
    | 'dal_roti'
    | 'rice_dal'
    | 'rice_sambhar'
    | 'rajma_rice'
    | 'chole_bhature'
    | 'sabzi_roti'
    | 'poha'
    | 'upma'
    | 'idli_sambar'
    | 'egg_curry'
    | 'chicken_curry'
    | 'fried_rice'
    | 'chapati_plain'
    | 'salad';

// ─── Coach Message Types ──────────────────────────────────────────

export type CoachMessageType =
    | 'daily_tip'
    | 'pre_workout'
    | 'post_workout'
    | 'missed_session'
    | 'weekly_review'
    | 'milestone'
    | 'adaptation_explain'
    | 'exam_week_support'
    | 'low_adherence';
