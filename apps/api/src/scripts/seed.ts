import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import { Exercise, Food } from '../models';
import type { Equipment, NoiseLevel, SpaceRequired } from '@fitmind/shared-types';

const seedExercises = [
    // ─── PUSHUPS & PUSHING ───────────────────────────────────────
    {
        id: 'pushup_knee',
        name: 'Knee Push-ups',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        equipmentRequired: [] as Equipment[],
        difficulty: 1,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'push', 'beginner'],
        contraindicatedConditions: ['wrist_injury', 'shoulder_injury'],
        instructions: 'Start on knees, keep body straight, lower chest to floor.',
    },
    {
        id: 'pushup_standard',
        name: 'Standard Push-ups',
        muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'push', 'fundamental'],
        contraindicatedConditions: ['wrist_injury', 'shoulder_injury'],
        instructions: 'Plank position, hands shoulder-width, lower until chest is 1 inch from floor.',
    },
    {
        id: 'pushup_diamond',
        name: 'Diamond Push-ups',
        muscleGroups: ['triceps', 'chest', 'shoulders', 'core'],
        equipmentRequired: [] as Equipment[],
        difficulty: 3,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'push', 'triceps'],
        contraindicatedConditions: ['wrist_injury', 'shoulder_injury', 'elbow_injury'],
        instructions: 'Hands close together forming a diamond, lower chest to hands.',
    },
    {
        id: 'pushup_pike',
        name: 'Pike Push-ups',
        muscleGroups: ['shoulders', 'triceps', 'upper_chest'],
        equipmentRequired: [] as Equipment[],
        difficulty: 3,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'push', 'shoulders'],
        contraindicatedConditions: ['wrist_injury', 'shoulder_injury'],
        instructions: 'Downward dog position, lower head to the floor between hands.',
    },
    {
        id: 'pushup_archer',
        name: 'Archer Push-ups',
        muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
        equipmentRequired: [] as Equipment[],
        difficulty: 4,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['bodyweight', 'push', 'advanced'],
        contraindicatedConditions: ['wrist_injury', 'shoulder_injury'],
        instructions: 'Wide stance, lower to one side keeping the other arm straight.',
    },

    // ─── SQUATS & LEGS ───────────────────────────────────────────
    {
        id: 'squat_bw',
        name: 'Bodyweight Squats',
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        equipmentRequired: [] as Equipment[],
        difficulty: 1,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'fundamental'],
        contraindicatedConditions: ['knee_injury'],
        instructions: 'Feet shoulder-width, sit back like entering a chair, keep chest up.',
    },
    {
        id: 'squat_pause',
        name: 'Pause Squats',
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'time_under_tension'],
        contraindicatedConditions: ['knee_injury'],
        instructions: 'Squat down, hold the bottom position for 3 seconds, then explode up.',
    },
    {
        id: 'squat_jump',
        name: 'Jump Squats',
        muscleGroups: ['quads', 'glutes', 'calves', 'cardio'],
        equipmentRequired: [] as Equipment[],
        difficulty: 3,
        noiseLevel: 'normal' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'plyometric', 'high_impact', 'jump'],
        contraindicatedConditions: ['knee_injury', 'ankle_injury', 'back_injury'],
        instructions: 'Squat down and explode upwards into a jump, land softly.',
    },
    {
        id: 'lunge_forward',
        name: 'Forward Lunges',
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'unilateral'],
        contraindicatedConditions: ['knee_injury'],
        instructions: 'Step forward, lower back knee to floor, push back to start.',
    },
    {
        id: 'lunge_reverse',
        name: 'Reverse Lunges',
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'unilateral', 'knee_friendly'],
        contraindicatedConditions: ['severe_knee_injury'],
        instructions: 'Step backward, lower back knee to floor, push forward to start.',
    },
    {
        id: 'squat_bulgarian',
        name: 'Bulgarian Split Squats',
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        equipmentRequired: [] as Equipment[],
        difficulty: 4,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'unilateral', 'advanced'],
        contraindicatedConditions: ['knee_injury', 'balance_issues'],
        instructions: 'Rear foot elevated on a chair/bed, lower front leg until thigh is parallel.',
    },
    {
        id: 'squat_pistol_assisted',
        name: 'Assisted Pistol Squats',
        muscleGroups: ['quads', 'glutes', 'core'],
        equipmentRequired: [] as Equipment[],
        difficulty: 4,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'legs', 'unilateral', 'mobility'],
        contraindicatedConditions: ['knee_injury', 'hip_injury'],
        instructions: 'Hold a doorframe, perform a one-legged squat keeping the other leg straight out.',
    },

    // ─── CORE & ABS ──────────────────────────────────────────────
    {
        id: 'plank_knee',
        name: 'Knee Plank',
        muscleGroups: ['core', 'shoulders'],
        equipmentRequired: [] as Equipment[],
        difficulty: 1,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'core', 'isometric', 'beginner'],
        contraindicatedConditions: ['shoulder_injury'],
        instructions: 'Rest on forearms and knees, keep back straight. Hold.',
    },
    {
        id: 'plank_standard',
        name: 'Standard Plank',
        muscleGroups: ['core', 'shoulders', 'glutes'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'core', 'isometric'],
        contraindicatedConditions: ['shoulder_injury'],
        instructions: 'Rest on forearms and toes, keep body in a straight line. Hold.',
    },
    {
        id: 'plank_side',
        name: 'Side Plank',
        muscleGroups: ['obliques', 'core', 'shoulders'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'core', 'isometric', 'lateral'],
        contraindicatedConditions: ['shoulder_injury'],
        instructions: 'Rest on one forearm and side of foot, lift hips to form a straight line.',
    },
    {
        id: 'dead_bug',
        name: 'Dead Bugs',
        muscleGroups: ['core', 'lower_abs'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'core', 'anti_extension'],
        contraindicatedConditions: ['lower_back_injury'],
        instructions: 'Lie on back, lower opposite arm and leg to the floor without arching back.',
    },
    {
        id: 'hollow_body',
        name: 'Hollow Body Hold',
        muscleGroups: ['core', 'lower_abs'],
        equipmentRequired: [] as Equipment[],
        difficulty: 4,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'core', 'gymnastics', 'advanced'],
        contraindicatedConditions: ['lower_back_injury'],
        instructions: 'Lie on back, press lower back into floor, raise arms and legs slightly. Hold.',
    },
    {
        id: 'russian_twist',
        name: 'Russian Twists',
        muscleGroups: ['obliques', 'core'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'core', 'rotation'],
        contraindicatedConditions: ['lower_back_injury'],
        instructions: 'Sit up slightly, lift feet off floor, twist torso side to side.',
    },

    // ─── PULLING & BACK (Minimal Eq/Hostel) ──────────────────────
    {
        id: 'superman',
        name: 'Superman Holds',
        muscleGroups: ['lower_back', 'glutes', 'upper_back'],
        equipmentRequired: [] as Equipment[],
        difficulty: 1,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'back', 'isometric'],
        contraindicatedConditions: ['severe_back_injury'],
        instructions: 'Lie on stomach, lift chest, arms, and legs off the floor. Squeeze back.',
    },
    {
        id: 'towel_row',
        name: 'Doorway Towel Rows',
        muscleGroups: ['lats', 'biceps', 'upper_back'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'pull', 'hostel_hack'],
        contraindicatedConditions: [],
        instructions: 'Wrap a sturdy towel around a doorknob/pillar, lean back, and pull yourself up.',
    },
    {
        id: 'pullup_negative',
        name: 'Negative Pull-ups',
        muscleGroups: ['lats', 'biceps', 'back'],
        equipmentRequired: ['pull_up_bar'] as Equipment[],
        difficulty: 3,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'pull', 'progression'],
        contraindicatedConditions: ['shoulder_injury', 'elbow_injury'],
        instructions: 'Jump up to the top of a pull-up, lower yourself as slowly as possible.',
    },
    {
        id: 'pullup_standard',
        name: 'Pull-ups',
        muscleGroups: ['lats', 'biceps', 'back', 'core'],
        equipmentRequired: ['pull_up_bar'] as Equipment[],
        difficulty: 4,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['bodyweight', 'pull', 'fundamental'],
        contraindicatedConditions: ['shoulder_injury', 'elbow_injury'],
        instructions: 'Hang from bar, pull collarbone to the bar, lower with control.',
    },

    // ─── YOGA & MOBILITY ─────────────────────────────────────────
    {
        id: 'yoga_surya_namaskar',
        name: 'Surya Namaskar (Sun Salutation)',
        muscleGroups: ['full_body', 'core', 'flexibility'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['yoga', 'mobility', 'warmup'],
        contraindicatedConditions: [],
        instructions: 'Perform the 12-step sequence linking breath with continuous motion.',
    },
    {
        id: 'mobility_cat_cow',
        name: 'Cat-Cow Stretch',
        muscleGroups: ['lower_back', 'core', 'neck'],
        equipmentRequired: [] as Equipment[],
        difficulty: 1,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['mobility', 'warmup', 'recovery'],
        contraindicatedConditions: [],
        instructions: 'On all fours, arch back up (cat) then dip back down (cow) smoothly.',
    },
    {
        id: 'mobility_wgs',
        name: 'World\'s Greatest Stretch',
        muscleGroups: ['hips', 'thoracic_spine', 'hamstrings'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'silent' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['mobility', 'warmup', 'full_body'],
        contraindicatedConditions: [],
        instructions: 'Lunge forward, drop inside elbow to foot, then twist and reach arm to sky.',
    },

    // ─── EQUIPMENT DUMBBELLS ─────────────────────────────────────
    {
        id: 'db_goblet_squat',
        name: 'Dumbbell Goblet Squats',
        muscleGroups: ['quads', 'glutes', 'core'],
        equipmentRequired: ['dumbbells'] as Equipment[],
        difficulty: 2,
        noiseLevel: 'low' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['weights', 'legs', 'fundamental'],
        contraindicatedConditions: ['knee_injury'],
        instructions: 'Hold one db at chest level. Squat down keeping elbows inside knees.',
    },
    {
        id: 'db_bench_press',
        name: 'Dumbbell Bench Press',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        equipmentRequired: ['dumbbells', 'bench'] as Equipment[],
        difficulty: 3,
        noiseLevel: 'low' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['weights', 'push', 'fundamental'],
        contraindicatedConditions: ['shoulder_injury'],
        instructions: 'Lie on bench, press dumbbells up over chest.',
    },
    {
        id: 'db_rdl',
        name: 'Dumbbell RDL',
        muscleGroups: ['hamstrings', 'glutes', 'lower_back'],
        equipmentRequired: ['dumbbells'] as Equipment[],
        difficulty: 3,
        noiseLevel: 'low' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['weights', 'hinge', 'fundamental'],
        contraindicatedConditions: ['lower_back_injury'],
        instructions: 'Hinge at hips pushing them back, keeping legs mostly straight, lower DBs to shin level.',
    },
    {
        id: 'db_lateral_raise',
        name: 'Dumbbell Lateral Raises',
        muscleGroups: ['shoulders'],
        equipmentRequired: ['dumbbells'] as Equipment[],
        difficulty: 2,
        noiseLevel: 'low' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['weights', 'isolation', 'shoulders'],
        contraindicatedConditions: ['shoulder_injury'],
        instructions: 'Raise dumbbells to the side until parallel with floor. Slight bend in elbows.',
    },
    {
        id: 'db_bicep_curl',
        name: 'Dumbbell Bicep Curls',
        muscleGroups: ['biceps'],
        equipmentRequired: ['dumbbells'] as Equipment[],
        difficulty: 1,
        noiseLevel: 'low' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['weights', 'isolation', 'arms'],
        contraindicatedConditions: ['elbow_injury'],
        instructions: 'Keep elbows pinned to side, curl weight up towards shoulders.',
    },
    {
        id: 'db_overhead_extension',
        name: 'Dumbbell Overhead Tricep Extension',
        muscleGroups: ['triceps'],
        equipmentRequired: ['dumbbells'] as Equipment[],
        difficulty: 2,
        noiseLevel: 'low' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['weights', 'isolation', 'arms'],
        contraindicatedConditions: ['shoulder_injury', 'elbow_injury'],
        instructions: 'Hold one db overhead with both hands, lower behind head, then extend up.',
    },

    // ─── CARDIO & HIIT ───────────────────────────────────────────
    {
        id: 'jumping_jacks',
        name: 'Jumping Jacks',
        muscleGroups: ['calves', 'cardio', 'shoulders'],
        equipmentRequired: [] as Equipment[],
        difficulty: 1,
        noiseLevel: 'normal' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['cardio', 'warmup', 'high_impact'],
        contraindicatedConditions: ['knee_injury', 'ankle_injury'],
        instructions: 'Jump legs apart while raising arms overhead, jump back together.',
    },
    {
        id: 'burpees',
        name: 'Burpees',
        muscleGroups: ['full_body', 'cardio', 'chest', 'legs'],
        equipmentRequired: [] as Equipment[],
        difficulty: 4,
        noiseLevel: 'normal' as NoiseLevel,
        spaceRequired: 'medium' as SpaceRequired,
        tags: ['cardio', 'conditioning', 'high_impact', 'advanced'],
        contraindicatedConditions: ['knee_injury', 'shoulder_injury', 'wrist_injury'],
        instructions: 'Drop to a pushup, jump feet in, jump straight up into the air.',
    },
    {
        id: 'mountain_climbers',
        name: 'Mountain Climbers',
        muscleGroups: ['core', 'cardio', 'shoulders'],
        equipmentRequired: [] as Equipment[],
        difficulty: 2,
        noiseLevel: 'normal' as NoiseLevel,
        spaceRequired: 'minimal' as SpaceRequired,
        tags: ['cardio', 'core'],
        contraindicatedConditions: ['wrist_injury', 'shoulder_injury'],
        instructions: 'Plank position, rapidly alternate bringing knees to chest.',
    },
];

const seedFoods = [
    // ─── NORTH INDIA ─────────────────────────────────────────────
    { name: 'Dal Tadka', regionCode: 'north_india', caloriesPer100g: 110, proteinPer100g: 5.5, carbsPer100g: 15, fatPer100g: 3, tags: ['vegetarian', 'mess_staple', 'lunch'] },
    { name: 'Paneer Bhurji', regionCode: 'north_india', caloriesPer100g: 220, proteinPer100g: 14, carbsPer100g: 5, fatPer100g: 16, tags: ['vegetarian', 'high_protein', 'dinner'] },
    { name: 'Wheat Roti', regionCode: 'north_india', caloriesPer100g: 297, proteinPer100g: 10, carbsPer100g: 60, fatPer100g: 2.5, tags: ['vegetarian', 'vegan', 'mess_staple', 'carbs'] },
    { name: 'Chana Masala', regionCode: 'north_india', caloriesPer100g: 145, proteinPer100g: 6, carbsPer100g: 20, fatPer100g: 5, tags: ['vegetarian', 'vegan', 'mess_staple'] },
    { name: 'Rajma', regionCode: 'north_india', caloriesPer100g: 130, proteinPer100g: 5.5, carbsPer100g: 18, fatPer100g: 4, tags: ['vegetarian', 'vegan', 'mess_staple'] },
    { name: 'Chicken Curry', regionCode: 'north_india', caloriesPer100g: 160, proteinPer100g: 16, carbsPer100g: 4, fatPer100g: 9, tags: ['omnivore', 'high_protein'] },

    // ─── SOUTH INDIA ─────────────────────────────────────────────
    { name: 'Idli (Rice & Lentil)', regionCode: 'south_india', caloriesPer100g: 140, proteinPer100g: 4.5, carbsPer100g: 28, fatPer100g: 0.5, tags: ['vegetarian', 'vegan', 'breakfast', 'mess_staple'] },
    { name: 'Plain Dosa', regionCode: 'south_india', caloriesPer100g: 170, proteinPer100g: 4, carbsPer100g: 32, fatPer100g: 3, tags: ['vegetarian', 'vegan', 'breakfast', 'dinner'] },
    { name: 'Sambar', regionCode: 'south_india', caloriesPer100g: 75, proteinPer100g: 3, carbsPer100g: 12, fatPer100g: 2, tags: ['vegetarian', 'vegan', 'mess_staple'] },
    { name: 'Upma', regionCode: 'south_india', caloriesPer100g: 135, proteinPer100g: 3.5, carbsPer100g: 22, fatPer100g: 4, tags: ['vegetarian', 'breakfast'] },
    { name: 'Chicken Chettinad', regionCode: 'south_india', caloriesPer100g: 180, proteinPer100g: 15, carbsPer100g: 6, fatPer100g: 11, tags: ['omnivore', 'high_protein'] },

    // ─── EAST & WEST INDIA ───────────────────────────────────────
    { name: 'Fish Curry (Macher Jhol)', regionCode: 'east_india', caloriesPer100g: 120, proteinPer100g: 14, carbsPer100g: 3, fatPer100g: 6, tags: ['omnivore', 'high_protein'] },
    { name: 'Poha', regionCode: 'west_india', caloriesPer100g: 150, proteinPer100g: 3, carbsPer100g: 31, fatPer100g: 4, tags: ['vegetarian', 'vegan', 'breakfast'] },
    { name: 'Dhokla', regionCode: 'west_india', caloriesPer100g: 160, proteinPer100g: 6, carbsPer100g: 24, fatPer100g: 4.5, tags: ['vegetarian', 'snack'] },

    // ─── GLOBAL / HOSTEL / NO COOK ───────────────────────────────
    { name: 'White Rice (Cooked)', regionCode: 'global', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, tags: ['vegetarian', 'vegan', 'mess_staple', 'carbs'] },
    { name: 'Boiled Egg', regionCode: 'global', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1, fatPer100g: 11, tags: ['eggetarian', 'high_protein', 'snack', 'no_cook'] },
    { name: 'Peanut Butter (Unsweetened)', regionCode: 'global', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, tags: ['vegetarian', 'vegan', 'high_protein', 'fats', 'no_cook'] },
    { name: 'Whole Wheat Bread', regionCode: 'global', caloriesPer100g: 250, proteinPer100g: 10, carbsPer100g: 43, fatPer100g: 4, tags: ['vegetarian', 'vegan', 'carbs', 'no_cook'] },
    { name: 'Rolled Oats (Raw)', regionCode: 'global', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9, tags: ['vegetarian', 'vegan', 'breakfast', 'carbs', 'no_cook'] },
    { name: 'Whey Protein Isolate', regionCode: 'global', caloriesPer100g: 375, proteinPer100g: 85, carbsPer100g: 3, fatPer100g: 1, tags: ['vegetarian', 'high_protein', 'supplement', 'no_cook'] },
    { name: 'Soya Chunks (Dry)', regionCode: 'global', caloriesPer100g: 345, proteinPer100g: 52, carbsPer100g: 33, fatPer100g: 0.5, tags: ['vegetarian', 'vegan', 'high_protein', 'budget'] },
    { name: 'Banana', regionCode: 'global', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, tags: ['vegetarian', 'vegan', 'snack', 'carbs', 'no_cook'] },
    { name: 'Curd (Dahi)', regionCode: 'global', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, tags: ['vegetarian', 'snack', 'mess_staple', 'no_cook'] },
    { name: 'Roasted Chana (Chickpeas)', regionCode: 'global', caloriesPer100g: 369, proteinPer100g: 21, carbsPer100g: 58, fatPer100g: 5, tags: ['vegetarian', 'vegan', 'snack', 'high_protein', 'no_cook'] },
    { name: 'Milk (Toned)', regionCode: 'global', caloriesPer100g: 60, proteinPer100g: 3.3, carbsPer100g: 4.8, fatPer100g: 3, tags: ['vegetarian', 'breakfast', 'no_cook'] },
];

export async function seedDatabase() {
    try {
        await connectDB();

        console.log('🌱 Starting database seed check...');

        const exerciseCount = await Exercise.countDocuments();
        if (exerciseCount === 0) {
            console.log(`Inserting ${seedExercises.length} foundational exercises...`);
            await Exercise.insertMany(seedExercises);
            console.log('✅ Exercises seeded successfully.');
        } else {
            console.log(`Exercises already seeded (${exerciseCount} items).`);
        }

        const foodCount = await Food.countDocuments();
        if (foodCount === 0) {
            console.log(`Inserting ${seedFoods.length} foundational foods...`);
            await Food.insertMany(seedFoods);
            console.log('✅ Foods seeded successfully.');
        } else {
            console.log(`Foods already seeded (${foodCount} items).`);
        }

    } catch (error) {
        console.error('❌ Error during database seeding:', error);
    }
}

// Run directly if called via node
if (require.main === module) {
    seedDatabase().then(() => {
        console.log('Seed script complete.');
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
