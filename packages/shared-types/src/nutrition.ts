import type { FoodRegion, DietType, MessMealCategory } from './enums';

export interface Food {
    id: string;
    name: string;
    nameLocal?: string;
    regionCode: FoodRegion;
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

export interface MacroData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}

export interface MacroTargets {
    proteinG: number;
    carbsG: number;
    fatG: number;
}

export interface MacroEstimate {
    min: MacroData;
    max: MacroData;
    avg: MacroData;
    uncertaintyPercent: number;
}

export interface CostEstimate {
    dailyCost: number;
    weeklyCost: number;
    currency: string;
    isWithinBudget: boolean;
}

export interface MealItem {
    foodId: string;
    servingGrams: number;
    calories: number;
    protein: number;
}

export interface Meal {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: MealItem[];
    totalCalories: number;
    prepNotes: string;
    messAlternative: string | null;
}

export interface NutritionDayPlan {
    day: number;
    meals: Meal[];
    dailyTotals: MacroData;
    estimatedCost: number;
}

export interface GroceryItem {
    foodId: string;
    quantity: string;
}

export interface NutritionPlan {
    id: string;
    userId: string;
    weekNumber: number;
    days: NutritionDayPlan[];
    weeklyGroceryList: GroceryItem[];
    dietitianNote: string;
    generatedAt: string;
}

export interface MessMealMacros {
    category: MessMealCategory;
    portionSize: 'small' | 'medium' | 'large';
    estimate: MacroEstimate;
}
