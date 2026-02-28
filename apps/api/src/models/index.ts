import mongoose, { Schema, type Document } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────
export interface IFriendRequest {
    fromUserId: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    fullName?: string;
    username?: string;
    avatarUrl?: string;
    friends: mongoose.Types.ObjectId[];
    friendRequests: IFriendRequest[];
    activeTrack: 'standard' | 'exam_survival' | 'rehab' | '90_day_bulk';
    createdAt: Date;
    deletedAt?: Date;
}

const FriendRequestSubSchema = new Schema({
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: String,
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, minlength: 3, maxlength: 20 },
    avatarUrl: String,
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [FriendRequestSubSchema],
    activeTrack: { type: String, enum: ['standard', 'exam_survival', 'rehab', '90_day_bulk'], default: 'standard' },
    createdAt: { type: Date, default: Date.now },
    deletedAt: Date,
});

UserSchema.index({ username: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ─── Onboarding Progress (partial UCO stored between steps) ──────
export interface IOnboardingProgress extends Document {
    userId: mongoose.Types.ObjectId;
    partialData: Record<string, any>;
    lastStep: number;
    updatedAt: Date;
}

const OnboardingProgressSchema = new Schema<IOnboardingProgress>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    partialData: { type: Schema.Types.Mixed, default: {} },
    lastStep: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
});

export const OnboardingProgress = mongoose.models.OnboardingProgress || mongoose.model<IOnboardingProgress>('OnboardingProgress', OnboardingProgressSchema);

// ─── User Context (UCO — versioned document) ─────────────────────
export interface IUserContext extends Document {
    userId: mongoose.Types.ObjectId;
    version: number;
    data: Record<string, any>;
    isCurrent: boolean;
    createdAt: Date;
}

const UserContextSchema = new Schema<IUserContext>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    data: { type: Schema.Types.Mixed, required: true },
    isCurrent: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

UserContextSchema.index({ userId: 1, isCurrent: 1 });
UserContextSchema.index({ userId: 1, version: 1 }, { unique: true });

export const UserContext = mongoose.models.UserContext || mongoose.model<IUserContext>('UserContext', UserContextSchema);

// ─── Plans ────────────────────────────────────────────────────────
export interface IPlan extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'workout' | 'nutrition' | 'combined';
    weekNumber: number;
    data: Record<string, any>;
    safetyFlagsApplied: any[];
    aiModelVersion?: string;
    generatedAt: Date;
}

const PlanSchema = new Schema<IPlan>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['workout', 'nutrition', 'combined'], required: true },
    weekNumber: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    safetyFlagsApplied: { type: [Schema.Types.Mixed], default: [] },
    aiModelVersion: String,
    generatedAt: { type: Date, default: Date.now },
});

PlanSchema.index({ userId: 1, generatedAt: -1 });

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

// ─── Workout Logs ─────────────────────────────────────────────────
export interface IWorkoutLog extends Document {
    userId: mongoose.Types.ObjectId;
    planId?: mongoose.Types.ObjectId;
    date: Date;
    exercisesCompleted: Array<{
        exerciseId: string;
        sets: Array<{ reps: number; weightKg?: number; completed: boolean }>;
    }>;
    energyLevel: number;
    mood: number;
    sessionDurationMins?: number;
    notes?: string;
    createdAt: Date;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    date: { type: Date, required: true },
    exercisesCompleted: { type: [Schema.Types.Mixed], default: [] },
    energyLevel: { type: Number, min: 1, max: 5 },
    mood: { type: Number, min: 1, max: 5 },
    sessionDurationMins: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now },
});

WorkoutLogSchema.index({ userId: 1, date: -1 });

export const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);

// ─── Nutrition Logs ───────────────────────────────────────────────
export interface INutritionLog extends Document {
    userId: mongoose.Types.ObjectId;
    planId?: mongoose.Types.ObjectId;
    date: Date;
    mealsLogged: Array<{
        mealType: string;
        items: Array<{ foodId: string; servingGrams: number }>;
    }>;
    totalCalories?: number;
    waterMl: number;
    notes?: string;
    createdAt: Date;
}

const NutritionLogSchema = new Schema<INutritionLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    date: { type: Date, required: true },
    mealsLogged: { type: [Schema.Types.Mixed], default: [] },
    totalCalories: Number,
    waterMl: { type: Number, default: 0 },
    notes: String,
    createdAt: { type: Date, default: Date.now },
});

NutritionLogSchema.index({ userId: 1, date: -1 });

export const NutritionLog = mongoose.models.NutritionLog || mongoose.model<INutritionLog>('NutritionLog', NutritionLogSchema);

// ─── Foods (Regional) ─────────────────────────────────────────────
export interface IFood extends Document {
    name: string;
    nameLocal?: string;
    regionCode: string;
    caloriesPer100g: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    commonServingG: number;
    isMessFood: boolean;
    priceEstimateInr: number;
    tags: string[];
}

const FoodSchema = new Schema<IFood>({
    name: { type: String, required: true },
    nameLocal: String,
    regionCode: { type: String, required: true, index: true },
    caloriesPer100g: { type: Number, required: true },
    proteinG: { type: Number, required: true },
    carbsG: { type: Number, required: true },
    fatG: { type: Number, required: true },
    fiberG: { type: Number, default: 0 },
    commonServingG: { type: Number, required: true },
    isMessFood: { type: Boolean, default: false },
    priceEstimateInr: Number,
    tags: { type: [String], default: [], index: true },
});

FoodSchema.index({ name: 'text', nameLocal: 'text' });

export const Food = mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema);

// ─── Exercises ────────────────────────────────────────────────────
export interface IExercise extends Document {
    id: string;
    name: string;
    muscleGroups: string[];
    equipmentRequired: string[];
    difficulty: number;
    tags: string[];
    videoRef?: string;
    contraindicatedConditions: string[];
    instructions?: string;
    noiseLevel: string;
    spaceRequired: string;
}

const ExerciseSchema = new Schema<IExercise>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    muscleGroups: { type: [String], required: true, index: true },
    equipmentRequired: { type: [String], default: [] },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    tags: { type: [String], default: [], index: true },
    videoRef: String,
    contraindicatedConditions: { type: [String], default: [] },
    instructions: String,
    noiseLevel: { type: String, enum: ['silent', 'low', 'normal'], default: 'normal' },
    spaceRequired: { type: String, enum: ['minimal', 'medium', 'full'], default: 'medium' },
});

export const Exercise = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);

// ─── Check-Ins ────────────────────────────────────────────────────
export interface ICheckIn extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    energyLevel: number;
    mood: number;
    sleepHours: number;
    stressLevel: number;
    examWeek: boolean;
    notes?: string;
    createdAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    energyLevel: { type: Number, min: 1, max: 5, required: true },
    mood: { type: Number, min: 1, max: 5, required: true },
    sleepHours: { type: Number, required: true },
    stressLevel: { type: Number, min: 1, max: 5, required: true },
    examWeek: { type: Boolean, default: false },
    notes: String,
    createdAt: { type: Date, default: Date.now },
});

CheckInSchema.index({ userId: 1, date: -1 });

export const CheckIn = mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', CheckInSchema);

// ─── Coach Messages ──────────────────────────────────────────────
export interface ICoachMessage extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const CoachMessageSchema = new Schema<ICoachMessage>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

CoachMessageSchema.index({ userId: 1, createdAt: -1 });

export const CoachMessage = mongoose.models.CoachMessage || mongoose.model<ICoachMessage>('CoachMessage', CoachMessageSchema);

// ─── Streaks ──────────────────────────────────────────────────────
export interface IStreak extends Document {
    userId: mongoose.Types.ObjectId;
    workoutStreak: number;
    logStreak: number;
    longestWorkoutStreak: number;
    longestLogStreak: number;
    lastWorkoutDate?: Date;
    lastLogDate?: Date;
    updatedAt: Date;
}

const StreakSchema = new Schema<IStreak>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    workoutStreak: { type: Number, default: 0 },
    logStreak: { type: Number, default: 0 },
    longestWorkoutStreak: { type: Number, default: 0 },
    longestLogStreak: { type: Number, default: 0 },
    lastWorkoutDate: Date,
    lastLogDate: Date,
    updatedAt: { type: Date, default: Date.now },
});

export const Streak = mongoose.models.Streak || mongoose.model<IStreak>('Streak', StreakSchema);

// ─── Milestones ──────────────────────────────────────────────────
export interface IMilestone extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    title: string;
    description?: string;
    achievedAt: Date;
    celebrated: boolean;
}

const MilestoneSchema = new Schema<IMilestone>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    achievedAt: { type: Date, default: Date.now },
    celebrated: { type: Boolean, default: false },
});

MilestoneSchema.index({ userId: 1, achievedAt: -1 });

export const Milestone = mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);

// ─── Activity Feed ───────────────────────────────────────────────
export interface IActivityFeed extends Document {
    userId: mongoose.Types.ObjectId;
    action: 'logged_workout' | 'achieved_streak' | 'generated_plan' | 'completed_week' | 'joined_track';
    metadata: Record<string, any>;
    createdAt: Date;
}

const ActivityFeedSchema = new Schema<IActivityFeed>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
        type: String,
        enum: ['logged_workout', 'achieved_streak', 'generated_plan', 'completed_week', 'joined_track'],
        required: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
});

ActivityFeedSchema.index({ userId: 1, createdAt: -1 });

export const ActivityFeed = mongoose.models.ActivityFeed || mongoose.model<IActivityFeed>('ActivityFeed', ActivityFeedSchema);
