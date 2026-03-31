"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const argon2_1 = require("argon2");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const commonGymFoods = [
    {
        source: 'SEED',
        sourceId: 'chicken-breast',
        name: 'Chicken Breast',
        normalizedName: 'chicken breast',
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 165,
        proteinGramsPer100g: 31,
        carbsGramsPer100g: 0,
        fatGramsPer100g: 3.6,
        fiberGramsPer100g: 0,
        sugarGramsPer100g: 0,
        sodiumMilligramsPer100g: 74,
    },
    {
        source: 'SEED',
        sourceId: 'white-rice',
        name: 'White Rice',
        normalizedName: 'white rice',
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 130,
        proteinGramsPer100g: 2.7,
        carbsGramsPer100g: 28.2,
        fatGramsPer100g: 0.3,
        fiberGramsPer100g: 0.4,
        sugarGramsPer100g: 0.1,
        sodiumMilligramsPer100g: 1,
    },
    {
        source: 'SEED',
        sourceId: 'eggs',
        name: 'Eggs',
        normalizedName: 'eggs',
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 143,
        proteinGramsPer100g: 12.6,
        carbsGramsPer100g: 0.7,
        fatGramsPer100g: 9.5,
        fiberGramsPer100g: 0,
        sugarGramsPer100g: 0.7,
        sodiumMilligramsPer100g: 142,
    },
    {
        source: 'SEED',
        sourceId: 'oats',
        name: 'Oats',
        normalizedName: 'oats',
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 389,
        proteinGramsPer100g: 16.9,
        carbsGramsPer100g: 66.3,
        fatGramsPer100g: 6.9,
        fiberGramsPer100g: 10.6,
        sugarGramsPer100g: 0.9,
        sodiumMilligramsPer100g: 2,
    },
    {
        source: 'SEED',
        sourceId: 'banana',
        name: 'Banana',
        normalizedName: 'banana',
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 89,
        proteinGramsPer100g: 1.1,
        carbsGramsPer100g: 22.8,
        fatGramsPer100g: 0.3,
        fiberGramsPer100g: 2.6,
        sugarGramsPer100g: 12.2,
        sodiumMilligramsPer100g: 1,
    },
];
const commonHealthyRecipes = [
    {
        source: 'SEED',
        sourceId: 'grilled-chicken-rice-bowl',
        title: 'Grilled Chicken Rice Bowl',
        normalizedTitle: 'grilled chicken rice bowl',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
        calories: 520,
        protein: 42,
        cookTime: 30,
        ingredients: [
            '150 g grilled chicken breast',
            '1 cup cooked brown rice',
            '1 cup steamed broccoli',
            '1 tbsp olive oil',
            'Salt and black pepper',
        ],
        instructions: 'Season the chicken and grill until cooked through. Steam the broccoli, cook the brown rice, and assemble everything in a bowl. Finish with olive oil and fresh pepper.',
        sourceUrl: null,
        dietTags: ['high protein', 'balanced meal', 'meal prep'],
    },
    {
        source: 'SEED',
        sourceId: 'protein-overnight-oats',
        title: 'Protein Overnight Oats',
        normalizedTitle: 'protein overnight oats',
        image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=1200&q=80',
        calories: 390,
        protein: 28,
        cookTime: 10,
        ingredients: [
            '1/2 cup rolled oats',
            '1 scoop vanilla protein powder',
            '3/4 cup milk',
            '1 tbsp chia seeds',
            '1/2 banana sliced',
        ],
        instructions: 'Mix oats, protein powder, milk, and chia seeds in a jar. Chill overnight. Top with sliced banana before serving.',
        sourceUrl: null,
        dietTags: ['breakfast', 'high protein', 'easy prep'],
    },
    {
        source: 'SEED',
        sourceId: 'berry-protein-smoothie',
        title: 'Berry Protein Smoothie',
        normalizedTitle: 'berry protein smoothie',
        image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80',
        calories: 310,
        protein: 30,
        cookTime: 5,
        ingredients: [
            '1 scoop whey protein',
            '1 cup frozen mixed berries',
            '1 banana',
            '250 ml almond milk',
            '1 tbsp peanut butter',
        ],
        instructions: 'Blend all ingredients until smooth. Add more milk if needed for a thinner texture. Serve chilled.',
        sourceUrl: null,
        dietTags: ['smoothie', 'post workout', 'high protein'],
    },
];
async function main() {
    const defaultPassword = await (0, argon2_1.hash)('123');
    const users = Array.from({ length: 10 }).map(() => ({
        name: faker_1.faker.person.fullName(),
        email: faker_1.faker.internet.email(),
        avatar: faker_1.faker.image.avatar(),
        bio: faker_1.faker.lorem.sentence(),
        password: defaultPassword,
    }));
    await prisma.user.createMany({
        data: users,
    });
    const prismaWithFoodCache = prisma;
    if (prismaWithFoodCache.foodCache) {
        for (const food of commonGymFoods) {
            await prismaWithFoodCache.foodCache.upsert({
                where: {
                    source_sourceId: {
                        source: food.source,
                        sourceId: food.sourceId,
                    },
                },
                update: food,
                create: food,
            });
        }
    }
    if (prismaWithFoodCache.recipeCache) {
        for (const recipe of commonHealthyRecipes) {
            await prismaWithFoodCache.recipeCache.upsert({
                where: {
                    source_sourceId: {
                        source: recipe.source,
                        sourceId: recipe.sourceId,
                    },
                },
                update: recipe,
                create: recipe,
            });
        }
    }
    console.log('Seeding completed!');
}
main()
    .then(() => {
    prisma.$disconnect();
    process.exit(0);
})
    .catch((error) => {
    prisma.$disconnect();
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map