import * as mongoose from "mongoose";
import { IListModel } from '../interfaces/IListModel';

class RecipeModel {
    public schema: any;
    public model: any;
    public dbConnectionString: string;

    /**
     * Constructor to initialize the database connection and set up the schema and model.
     * @param DB_CONNECTION_STRING - Connection string for MongoDB.
     */
    public constructor(DB_CONNECTION_STRING: string) {
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.createSchema();
        this.createModel();
    }

    /**
     * Creates the Mongoose schema for a recipe.
     * Defines the structure for `recipe_ID`, `recipe_name`, `ingredients`, and `directions`.
     */
    public createSchema() {
        this.schema = new mongoose.Schema(
            {
                recipe_ID: { type: String, required: true },
                recipe_name: { type: String, required: true },
                ingredients: [
                    {
                        name: { type: String, required: true },
                        quantity: { type: Number, required: true },
                        unit: { type: String, enum: ['oz', 'cup', 'tbsp', 'tsp', 'g', 'kg', 'lb', 'each'], required: true }
                    }
                ],
                directions: [
                    {
                        step: { type: String, required: true } // allows changing individual steps
                    }
                ]
            },
            { collection: 'recipeList' }
        );
    }

    /**
     * Connects to the MongoDB database and creates the Mongoose model based on the schema.
     * The model is stored in `this.model`.
     * @returns void
     */
    public async createModel() {
        try {
            await mongoose.connect(this.dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            this.model = mongoose.model<IListModel>("RecipeList", this.schema);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Retrieves all recipes from the database.
     * @param response - The response object to send data back to the client.
     * @returns void - Sends a JSON array of all recipes in the response.
     */
    public async retrieveAllRecipes(response: any) {
        try {
            const itemArray = await this.model.find({}).exec();
            response.json(itemArray);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: "Failed to retrieve recipes" });
        }
    }

    /**
     * Retrieves a single recipe by `recipe_ID`.
     * @param response - The response object to send data back to the client.
     * @param recipeID - The unique ID of the recipe to retrieve.
     * @returns void - Sends a JSON object of the found recipe or an error if not found.
     */
    public async retrieveRecipe(response: any, recipeID: string) {
        try {
            const result = await this.model.findOne({ recipe_ID: recipeID }).exec();
            response.json(result);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: "Failed to retrieve recipe" });
        }
    }

    /**
     * Counts and retrieves the total number of recipes in the database.
     * @param response - The response object to send data back to the client.
     * @returns void - Sends the total count of recipes in JSON format.
     */
    public async retrieveRecipeListCount(response: any) {
        console.log("retrieve Recipe List Count ...");
        try {
            const numberOfRecipes = await this.model.estimatedDocumentCount().exec();
            console.log("numberOfRecipes: " + numberOfRecipes);
            response.json(numberOfRecipes);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: "Failed to retrieve recipe count" });
        }
    }

    /**
     * Deletes a recipe by its `recipe_ID`.
     * @param response - The response object to send data back to the client.
     * @param recipeId - The unique ID of the recipe to delete.
     * @returns void - Sends a success message with the deletion result.
     */
    public async deleteRecipe(response: any, recipeId: string) {
        try {
            const result = await this.model.deleteOne({ recipe_ID: recipeId }).exec();
            response.json({ message: `Recipe ${recipeId} deleted`, result });
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: "Failed to delete recipe" });
        }
    }

    /**
     * Updates the `directions` of a recipe by `recipe_ID`.
     * @param response - The response object to send data back to the client.
     * @param recipeId - The unique ID of the recipe to update.
     * @param directions - An array of strings representing the new steps for directions.
     * @returns void - Sends the updated recipe in JSON format.
     */
    public async updateDirections(response: any, recipeId: string, directions: string[]) {
        try {
            const result = await this.model.findOneAndUpdate(
                { recipe_ID: recipeId },
                { $set: { directions: directions.map((step) => ({ step })) } }, // mapping each string in the directions array to an object with a 'step'
                { new: true } // return updated document after the update
            ).exec();
            response.json(result);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: "Failed to update directions" });
        }
    }

    /**
     * Updates the `ingredients` of a recipe by `recipe_ID`.
     * @param response - The response object to send data back to the client.
     * @param recipeId - The unique ID of the recipe to update.
     * @param ingredients - An array of objects containing `name`, `quantity`, and `unit` for each ingredient.
     * @returns void - Sends the updated recipe in JSON format.
     */
    public async updateIngredients(response: any, recipeId: string, ingredients: { name: string, quantity: number, unit: string }[]) {
        try {
            const result = await this.model.findOneAndUpdate(
                { recipe_ID: recipeId },
                { $set: { ingredients } },
                { new: true }
            ).exec();
            response.json(result);
        } catch (e) {
            console.error(e);
            response.status(500).json({ error: "Failed to update ingredients" });
        }
    }
}

export { RecipeModel };