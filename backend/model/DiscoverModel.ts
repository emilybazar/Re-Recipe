import * as mongoose from "mongoose";
import { IRecipe } from "../interfaces/IRecipe";
import { RecipeModel } from "./RecipeModel";
import { IDiscover } from "../interfaces/IDiscover";
import { RecipeContentsModel } from "./RecipeContents";
const { ObjectId } = require('mongodb');

class DiscoverModel {
    public schema: mongoose.Schema;
    public model: mongoose.Model<IDiscover>;
    public dbConnectionString: string;
    public recipeModel = new RecipeModel();

    public constructor(DB_CONNECTION_STRING: string) {
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.createSchema();
        this.createModel();
    }

    public createSchema() {
        this.schema = new mongoose.Schema(
            {
                recipeList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
                modified_flag: { type: Boolean, default: false },
                user_ID: { type: String, required: true },
                recipe_ID: { type: mongoose.Schema.Types.ObjectId, required: true }, // Change from String to ObjectId
                recipe_name: { type: String, required: true },
                meal_category: [{ type: String }],
                recipe_versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeContents" }],
                image_url: { type: String, required: true },
                is_visible: { type: Boolean, default: false },
            },
            { collection: "discover" }
        );
    }

    public async createModel() {
        try {
            await mongoose.connect(this.dbConnectionString);
            this.model =
                mongoose.models.Discover || mongoose.model<IDiscover>("Discover", this.schema);
            console.log("Connected to MongoDB and initialized Discover model.");
        } catch (e) {
            console.error("Error connecting to MongoDB or initializing Discover model:", e);
        }
    }

    public async createRecipe(response: any, recipeData: IRecipe) {
        try {
            console.log("Creating recipe with data:", recipeData);

            let savedRecipe;

            // Use ObjectId for recipe_ID (MongoDB's native identifier)
            const recipeIdObjectId = new mongoose.Types.ObjectId();  // Generate new ObjectId

            let existingRecipe = await this.recipeModel.recipe.findOne({
                recipe_ID: recipeIdObjectId,  // Search with ObjectId
            });

            if (existingRecipe) {
                savedRecipe = existingRecipe;
                console.log("Recipe already exists:", savedRecipe);
            } else {
                const newRecipe = new this.recipeModel.recipe({
                    ...recipeData,
                    recipe_ID: recipeIdObjectId,  // Use ObjectId here
                    modified_flag: false,
                });

                console.log("Saving new recipe:", newRecipe);
                savedRecipe = await newRecipe.save();
                console.log("New Recipe saved:", savedRecipe);

                // Ensure user_ID is passed in the recipe contents
                const recipeVersion = new RecipeContentsModel({
                    recipe_ID: savedRecipe._id,
                    user_ID: recipeData.user_ID, // Include user_ID
                    cooking_duration: recipeData.cooking_duration || 25,
                    serving_size: recipeData.serving_size || 4,
                    ingredients: recipeData.ingredients || [],
                    directions: recipeData.directions || [],
                    version_number: 0, // Assuming it's the first version
                });

                console.log("Creating new recipe version:", recipeVersion);
                const savedRecipeContents = await recipeVersion.save();
                console.log("New Recipe version saved:", savedRecipeContents);

                // Add the saved recipe contents to the recipe's versions array
                savedRecipe.recipe_versions.push(savedRecipeContents._id);
                await savedRecipe.save();
                console.log("Recipe version added to recipe:", savedRecipe.recipe_versions);
            }

            // Now, create the Discover document linking to the saved recipe
            const newDiscoverDocument = new this.model({
                recipeList: [savedRecipe._id],  // Ensure the recipeList contains the saved recipe ID
                modified_flag: false,
                user_ID: recipeData.user_ID || "user005",  // Ensure user_ID is passed here
                recipe_ID: recipeIdObjectId,  // Use ObjectId here
                recipe_name: recipeData.recipe_name || savedRecipe.recipe_name,
                meal_category: recipeData.meal_category || [],
                recipe_versions: savedRecipe.recipe_versions || [],
                image_url: recipeData.image_url || "https://www.the-sun.com/wp-content/uploads/sites/6/2020/08/tp-graphic-rihanna-chef.jpg",
                is_visible: recipeData.is_visible !== undefined ? recipeData.is_visible : false,
            });

            console.log("Creating new Discover document:", newDiscoverDocument);
            await newDiscoverDocument.save();
            console.log("New Discover document saved:", newDiscoverDocument);

            response.status(201).json(savedRecipe);
        } catch (error) {
            console.error("Error adding recipe to Discover:", error);
            response.status(500).json({ error: "Failed to create new recipe" });
        }
    }

    
public async retrieveAllRecipes(response: any): Promise<void> {
    try {
        // Get all discover recipes and populate the 'recipe_versions' field
        const discoverRecipes = await this.model
            .find({})
            .populate('recipe_versions') 
            .exec();  

        response.json(discoverRecipes);
    } catch (error) {
        console.error("Error retrieving populated recipe:", error);
        response.status(500).json({ error: "Failed to fetch recipes." });
    }
}
    public async retrieveRecipe(response: any, recipe_ID: string) {
        try {
            console.log("Fetching Discover document for recipe_ID with populated recipe versions:", recipe_ID);
            const result = await this.model
                .findOne({ recipe_ID })
                .populate("recipe_versions") 
                .exec();
    
            if (result) {
                response.json(result);
            } else {
                response.status(404).json({ error: "Recipe not found" });
            }
        } catch (e) {
            console.error("Failed to retrieve recipe:", e);
            response.status(500).json({ error: "Failed to retrieve recipe" });
        }
    }
    public async deleteRecipe(response: any, recipe_ID: string): Promise<void> {
        try {
            // Convert recipe_ID to ObjectId using the helper
            const objectId = DiscoverModel.toObjectId(recipe_ID);
    
            // Find the Discover document by recipe_ID
            const recipe = await this.model
                .findOne({ recipe_ID: objectId })
                .populate("recipe_versions") // Populate recipe_versions to retrieve related content
                .exec();
    
            if (!recipe) {
                throw new Error("Recipe not found in Discover collection");
            }
    
            console.log("Deleting recipe with recipe_ID:", recipe_ID);
    
            // Delete all referenced recipe_versions from the RecipeContents collection
            const recipeVersionDeletionPromises = recipe.recipe_versions.map(versionId =>
                RecipeContentsModel.deleteOne({ recipe_ID: objectId }).exec()
            );
            await Promise.all(recipeVersionDeletionPromises);
            console.log("All referenced recipe_versions deleted");
    
            // Delete the main recipe document from the Recipe collection
            const recipeDeletionResult = await this.recipeModel.recipe.deleteOne({ recipe_ID: objectId }).exec();
            if (recipeDeletionResult.deletedCount === 0) {
                console.warn(`Recipe with ID ${objectId} not found in the Recipe collection`);
            } else {
                console.log(`Recipe with ID ${objectId} deleted from the Recipe collection`);
            }
    
            // Delete the Discover document
            const discoverDeletionResult = await this.model.deleteOne({ recipe_ID: objectId }).exec();
            if (discoverDeletionResult.deletedCount === 0) {
                console.warn(`Discover document with recipe_ID ${objectId} not found`);
            } else {
                console.log(`Discover document with recipe_ID ${objectId} deleted successfully`);
            }
    
            response.status(200).json({ message: "Recipe and related content deleted successfully" });
        } catch (error) {
            console.error("Error deleting recipe and related content:", error);
            response.status(500).json({ error: "Failed to delete recipe and related content" });
        }
    }
    

    // Helper function to convert to ObjectId
    private static toObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
        if (typeof id === "string") {
        if (mongoose.Types.ObjectId.isValid(id)) {
            return new mongoose.Types.ObjectId(id);
        } else {
            throw new Error(`Invalid ObjectId format: ${id}`);
        }
        } else if (id instanceof mongoose.Types.ObjectId) {
        return id; // Already an ObjectId
        } else {
        throw new Error(`Invalid ID type: ${typeof id}`);
        }
  }
}
export { DiscoverModel };