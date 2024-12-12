import * as mongoose from "mongoose";
import { IRecipeContents } from "../interfaces/IRecipeContents";

class RecipeContents {
  public schema: mongoose.Schema<IRecipeContents>;
  public contents: mongoose.Model<IRecipeContents>;

  public constructor() {
    this.createSchema();
    this.createModel();
  }

  private createSchema(): void {
    const schemaDefinition: mongoose.SchemaDefinition<IRecipeContents> = {
      user_ID: { type: String, required: true },
      recipe_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
      version_number: { type: Number, default: 1, required: true },
      cooking_duration: { type: Number, required: true },
      serving_size: { type: Number, required: true },
      ingredients: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          unit: {
            type: String,
            enum: ["oz", "cup", "tbsp", "tsp", "g", "kg", "lb", "each"],
            required: true,
          },
        },
      ],
      directions: [
        {
          step: { type: String, required: true },
        },
      ],
      notes: { type: String },
    };

    this.schema = new mongoose.Schema(schemaDefinition, { collection: "recipe_contents" });
  }

  private createModel(): void {
    this.contents = mongoose.model<IRecipeContents>("RecipeContents", this.schema, "recipe_contents");
  }

  // Static method for deletion by ID
  public static async deleteById(recipe_ID: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(recipe_ID)) {
        throw new Error(`Invalid ObjectId format: ${recipe_ID}`);
      }

      const result = await RecipeContentsModel.deleteOne({ _id: recipe_ID }).exec();

      if (result.deletedCount === 0) {
        console.warn(`No recipe content found with ID: ${recipe_ID}`);
      } else {
        console.log(`Successfully deleted recipe content with ID: ${recipe_ID}`);
      }
    } catch (error) {
      console.error(`Error deleting recipe content with ID: ${recipe_ID}`, error);
      throw new Error(`Failed to delete recipe content with ID: ${recipe_ID}`);
    }
  }

  // Static methods for querying
  public static async findByRecipeID(recipe_ID: string): Promise<IRecipeContents[]> {
    try {
      return RecipeContentsModel.find({ recipe_ID }).exec();
    } catch (error) {
      console.error(`Error finding recipe contents by recipe_ID: ${recipe_ID}`, error);
      throw new Error(`Failed to find recipe contents by recipe_ID: ${recipe_ID}`);
    }
  }

  public static async findByUserID(user_ID: string): Promise<IRecipeContents[]> {
    try {
      return RecipeContentsModel.find({ user_ID }).exec();
    } catch (error) {
      console.error(`Error finding recipe contents by user_ID: ${user_ID}`, error);
      throw new Error(`Failed to find recipe contents by user_ID: ${user_ID}`);
    }
  }
}

// Initialize the model
const RecipeContentsModel = mongoose.model<IRecipeContents>(
  "RecipeContents",
  new RecipeContents().schema,
  "recipe_contents"
);

export { RecipeContentsModel };