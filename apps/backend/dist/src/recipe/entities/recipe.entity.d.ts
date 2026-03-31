export declare class Recipe {
    id: string;
    source: string;
    sourceId: string;
    title: string;
    image: string;
    calories?: number | null;
    protein?: number | null;
    cookTime?: number | null;
    ingredients: string[];
    instructions: string;
    sourceUrl?: string | null;
    dietTags: string[];
}
