export interface IRecipe {
    user_ID: string;
    recipe_ID: string;
    recipe_name: string;
    category: string[]; 
    cooking_duration: number;
    ingredients: {
        ingredient_id?: string;
        name: string;
        quantity: number;
        unit: string;
    }[];
    directions: {
        step: string;
    }[];
    image_url?: string;
    is_visible?: boolean;
    personal_recipe_ID?: string;
    notes?: string;
    version_number?: number;
}