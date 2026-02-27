import type {
    Food, MacroData, MacroEstimate, CostEstimate, MessMealCategory,
    FoodRegion, DietType,
} from '@fitmind/shared-types';

// ─── Mess Meal Macro Estimates ───────────────────────────────────

const MESS_MEAL_MACROS: Record<MessMealCategory, { min: MacroData; max: MacroData; avg: MacroData }> = {
    dal_roti: {
        min: { calories: 280, protein: 10, carbs: 40, fat: 8, fiber: 5 },
        max: { calories: 420, protein: 16, carbs: 60, fat: 14, fiber: 8 },
        avg: { calories: 350, protein: 13, carbs: 50, fat: 11, fiber: 6.5 },
    },
    rice_dal: {
        min: { calories: 320, protein: 10, carbs: 55, fat: 6, fiber: 4 },
        max: { calories: 480, protein: 16, carbs: 80, fat: 12, fiber: 7 },
        avg: { calories: 400, protein: 13, carbs: 67, fat: 9, fiber: 5.5 },
    },
    rice_sambhar: {
        min: { calories: 300, protein: 8, carbs: 50, fat: 7, fiber: 5 },
        max: { calories: 450, protein: 14, carbs: 75, fat: 12, fiber: 8 },
        avg: { calories: 375, protein: 11, carbs: 62, fat: 9.5, fiber: 6.5 },
    },
    rajma_rice: {
        min: { calories: 380, protein: 14, carbs: 60, fat: 8, fiber: 8 },
        max: { calories: 520, protein: 20, carbs: 82, fat: 14, fiber: 12 },
        avg: { calories: 450, protein: 17, carbs: 71, fat: 11, fiber: 10 },
    },
    chole_bhature: {
        min: { calories: 450, protein: 12, carbs: 55, fat: 20, fiber: 6 },
        max: { calories: 650, protein: 18, carbs: 80, fat: 32, fiber: 10 },
        avg: { calories: 550, protein: 15, carbs: 67, fat: 26, fiber: 8 },
    },
    sabzi_roti: {
        min: { calories: 250, protein: 8, carbs: 38, fat: 7, fiber: 5 },
        max: { calories: 380, protein: 12, carbs: 55, fat: 13, fiber: 8 },
        avg: { calories: 315, protein: 10, carbs: 46, fat: 10, fiber: 6.5 },
    },
    poha: {
        min: { calories: 200, protein: 4, carbs: 38, fat: 5, fiber: 2 },
        max: { calories: 320, protein: 7, carbs: 55, fat: 10, fiber: 4 },
        avg: { calories: 260, protein: 5.5, carbs: 46, fat: 7.5, fiber: 3 },
    },
    upma: {
        min: { calories: 180, protein: 4, carbs: 32, fat: 5, fiber: 2 },
        max: { calories: 300, protein: 7, carbs: 50, fat: 10, fiber: 4 },
        avg: { calories: 240, protein: 5.5, carbs: 41, fat: 7.5, fiber: 3 },
    },
    idli_sambar: {
        min: { calories: 220, protein: 6, carbs: 40, fat: 3, fiber: 3 },
        max: { calories: 350, protein: 10, carbs: 62, fat: 7, fiber: 6 },
        avg: { calories: 285, protein: 8, carbs: 51, fat: 5, fiber: 4.5 },
    },
    egg_curry: {
        min: { calories: 300, protein: 14, carbs: 20, fat: 18, fiber: 2 },
        max: { calories: 450, protein: 22, carbs: 35, fat: 28, fiber: 4 },
        avg: { calories: 375, protein: 18, carbs: 27, fat: 23, fiber: 3 },
    },
    chicken_curry: {
        min: { calories: 350, protein: 25, carbs: 15, fat: 20, fiber: 2 },
        max: { calories: 520, protein: 38, carbs: 25, fat: 32, fiber: 4 },
        avg: { calories: 435, protein: 31, carbs: 20, fat: 26, fiber: 3 },
    },
    fried_rice: {
        min: { calories: 350, protein: 8, carbs: 55, fat: 12, fiber: 2 },
        max: { calories: 500, protein: 14, carbs: 78, fat: 20, fiber: 4 },
        avg: { calories: 425, protein: 11, carbs: 66, fat: 16, fiber: 3 },
    },
    chapati_plain: {
        min: { calories: 70, protein: 2, carbs: 14, fat: 1, fiber: 1 },
        max: { calories: 120, protein: 4, carbs: 22, fat: 3, fiber: 2 },
        avg: { calories: 95, protein: 3, carbs: 18, fat: 2, fiber: 1.5 },
    },
    salad: {
        min: { calories: 30, protein: 1, carbs: 6, fat: 0.5, fiber: 2 },
        max: { calories: 80, protein: 3, carbs: 15, fat: 2, fiber: 4 },
        avg: { calories: 55, protein: 2, carbs: 10, fat: 1.2, fiber: 3 },
    },
};

// ─── Public API ──────────────────────────────────────────────────

export function getFoodsForUser(
    allFoods: Food[],
    region: FoodRegion,
    dietType: DietType,
    budget: number,
): Food[] {
    const DIET_EXCLUDED_TAGS: Record<string, string[]> = {
        vegetarian: ['non_veg', 'meat', 'fish', 'seafood'],
        vegan: ['non_veg', 'meat', 'fish', 'seafood', 'dairy', 'egg'],
        eggetarian: ['non_veg', 'meat', 'fish', 'seafood'],
        jain: ['non_veg', 'meat', 'fish', 'seafood', 'root_vegetable', 'onion', 'garlic'],
        halal: ['pork', 'alcohol'],
        kosher: ['pork', 'shellfish'],
        omnivore: [],
    };

    const excluded = DIET_EXCLUDED_TAGS[dietType] || [];

    return allFoods.filter((food) => {
        // Region filter (include global + user's region)
        if (food.regionCode !== region && food.regionCode !== 'global') return false;

        // Diet filter
        if (food.tags.some((tag) => excluded.includes(tag))) return false;

        // Budget filter (per serving cost)
        const servingCost = (food.priceEstimateInr / 100) * food.commonServingG;
        if (servingCost > budget * 0.4) return false; // No single item should cost >40% of daily budget

        return true;
    });
}

export function searchFoods(
    allFoods: Food[],
    query: string,
    region: FoodRegion,
    limit = 20,
): Food[] {
    const q = query.toLowerCase();
    return allFoods
        .filter((food) => {
            const matchesRegion = food.regionCode === region || food.regionCode === 'global';
            const matchesName = food.name.toLowerCase().includes(q) ||
                (food.nameLocal?.toLowerCase().includes(q) ?? false);
            return matchesRegion && matchesName;
        })
        .slice(0, limit);
}

export function getFoodMacros(food: Food, servingGrams: number): MacroData {
    const factor = servingGrams / 100;
    return {
        calories: Math.round(food.caloriesPer100g * factor),
        protein: Math.round(food.proteinG * factor * 10) / 10,
        carbs: Math.round(food.carbsG * factor * 10) / 10,
        fat: Math.round(food.fatG * factor * 10) / 10,
        fiber: Math.round(food.fiberG * factor * 10) / 10,
    };
}

export function estimateMessMealMacros(
    category: MessMealCategory,
    portionSize: 'small' | 'medium' | 'large',
): MacroEstimate {
    const base = MESS_MEAL_MACROS[category];
    if (!base) {
        return { min: base.min, max: base.max, avg: base.avg, uncertaintyPercent: 15 };
    }

    const multiplier = portionSize === 'small' ? 0.7 : portionSize === 'large' ? 1.3 : 1.0;

    const scale = (data: MacroData): MacroData => ({
        calories: Math.round(data.calories * multiplier),
        protein: Math.round(data.protein * multiplier * 10) / 10,
        carbs: Math.round(data.carbs * multiplier * 10) / 10,
        fat: Math.round(data.fat * multiplier * 10) / 10,
        fiber: Math.round(data.fiber * multiplier * 10) / 10,
    });

    return {
        min: scale(base.min),
        max: scale(base.max),
        avg: scale(base.avg),
        uncertaintyPercent: 15,
    };
}

export function estimatePlanCost(
    mealItems: Array<{ foodId: string; servingGrams: number }>,
    allFoods: Food[],
): CostEstimate {
    let dailyCost = 0;
    const foodMap = new Map(allFoods.map((f) => [f.id, f]));

    for (const item of mealItems) {
        const food = foodMap.get(item.foodId);
        if (food) {
            dailyCost += (food.priceEstimateInr / 100) * item.servingGrams;
        }
    }

    return {
        dailyCost: Math.round(dailyCost),
        weeklyCost: Math.round(dailyCost * 7),
        currency: 'INR',
        isWithinBudget: true, // caller checks against user budget
    };
}
