import * as mongoose from "mongoose";
import { IRecipe } from "../interfaces/IRecipe";
import { RecipeModel } from "./RecipeModel";
import { DiscoverModel } from "./DiscoverModel";
import { ICookbook } from "../interfaces/ICookbook";

class CookbookModel {
  public schema: mongoose.Schema;
  public model: mongoose.Model<ICookbook>;
  public dbConnectionString: string;
  private discoverModel: DiscoverModel;
  private recipeModel: RecipeModel;

  /**
   * Constructor to initialize the database connection and set up the schema and model.
   * @param {string} DB_CONNECTION_STRING - MongoDB connection string.
   */
  public constructor(DB_CONNECTION_STRING: string, discoverModel) {
    this.dbConnectionString = DB_CONNECTION_STRING;
    this.createSchema();
    this.createModel();
    this.discoverModel = discoverModel;
    this.recipeModel = new RecipeModel();
  }

  /**
   * Defines the schema for a cookbook with a user reference and arrays for modified and saved recipes.
   */
  public createSchema() {
    this.schema = new mongoose.Schema(
      {
        user_ID: { type: String, required: true, unique: true },
        title: { type: String, default: "My Cookbook" },
        modified_recipes: {
          type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
          default: [],
        },
      },
      { collection: "cookbooks", timestamps: true }
    );
  }

  /**
   * Connects to the MongoDB database and creates the Mongoose model based on the schema.
   */
  public async createModel() {
    try {
      if (!mongoose.models.Cookbook) {
        this.model = mongoose.model<ICookbook>("Cookbook", this.schema); // Define the model if it doesn't exist
        console.log("Created Cookbook model.");
      } else {
        this.model = mongoose.models.Cookbook; // Use the existing model
        console.log("Using existing Cookbook model.");
      }
    } catch (error) {
      console.error("Error creating Cookbook model:", error);
    }
  }

  public async createCookbook(
    userId: string,
    title: string = "myCookbook"
  ): Promise<void> {
    try {
      console.log(
        `Creating cookbook for user_ID: ${userId} with title: ${title}`
      );

      const existingCookbook = await this.model
        .findOne({ user_ID: userId })
        .exec();
      if (existingCookbook) {
        console.log(`Cookbook already exists for user_ID: ${userId}`);
        return;
      }

      const newCookbook = new this.model({
        user_ID: userId,
        title,
        modified_recipes: [],
      });

      const savedCookbook = await newCookbook.save();
      console.log("New cookbook created:", savedCookbook);
    } catch (error) {
      console.error("Error creating cookbook:", error);
      throw new Error("Cookbook creation failed.");
    }
  }

  public async copyRecipesFromDiscover(
    response: any,
    recipe_IDs: any[],
    user_id: string
  ): Promise<void> {
    console.log("here in cookbookModel");

    try {
      var ObjectId = require("mongoose").Types.ObjectId;
      const discoverCollection = mongoose.connection.collection("discover");
      // Fetch all the needed recipes from the Discover collection
      const objectIdRecipeIDs = recipe_IDs.map((id) => new ObjectId(id));

      const originalRecipes = await discoverCollection
        .find({ recipe_ID: { $in: objectIdRecipeIDs } })
        .toArray();
      // let id = new ObjectId("6741035b0a68f1169e0d8190");
      // const originalRecipes2 = await discoverCollection.findOne({
      //   recipe_ID: id,
      // });
      // console.log(originalRecipes2);
      // originalRecipes.push(originalRecipes2);

      // console.log(originalRecipes2);

      if (!originalRecipes || originalRecipes.length === 0) {
        return response.status(404).json({
          error: "No recipes found in Discover with the provided IDs!",
        });
      }

      // const userCookbook = await cookbookCollection.findOne({ user_ID }).modified_r
      const filter = { user_ID: user_id };

      const update = {
        $push: { modified_recipes: { $each: originalRecipes } },
      };

      const userCookbook = await this.model.findOneAndUpdate(filter, update);
      await userCookbook.save();

      console.log("Updated cookbook for user:", user_id);
      return response.status(200).json();
    } catch (error) {
      console.error("Failed to copy recipes from Discover:", error);
      response
        .status(500)
        .json({ error: "Failed to copy recipes from Discover" });
    }
  }

  /**
   * Copies a recipe from the Discover collection and adds it to the user's cookbook.
   * @param {any} response - The response object to send data back to the client.
   * @param {string} recipe_ID - The ID of the recipe to copy from Discover.
   * @param {string} user_ID - The ID of the user to whom the new recipe will belong.
   * @returns {Promise<void>}
   */
  public async copyRecipeFromDiscover2(
    response: any,
    recipe_ID: string,
    user_ID: string
  ): Promise<void> {
    try {
      // Use the existing model from DiscoverModel to retrieve the recipe
      const originalRecipe = await this.discoverModel.model
        .findOne({ _id: recipe_ID })
        .exec();
      if (!originalRecipe) {
        return response
          .status(404)
          .json({ error: "Recipe not found in Discover!" });
      }

      // Create a copy of the recipe and add user-specific data
      const newRecipeData: { user_ID: string } = {
        ...originalRecipe.toObject(),
        user_ID,
      };

      // Create a new recipe document using RecipeModel
      const recipeModelInstance = new RecipeModel();
      const newRecipe = new recipeModelInstance.recipe(newRecipeData);
      await newRecipe.save();

      // Find or create the user's cookbook
      let cookbook = await this.model.findOne({ user_ID }).exec();
      if (!cookbook) {
        cookbook = new this.model({
          user_ID,
          modified_recipes: [newRecipe._id],
        });
      } else {
        cookbook.modified_recipes.push(newRecipe._id);
      }

      // Save the updated cookbook and respond
      const savedCookbook = await cookbook.save();
      response.status(201).json(savedCookbook);
    } catch (error) {
      console.error("Failed to copy recipe from Discover:", error);
      response
        .status(500)
        .json({ error: "Failed to copy recipe from Discover" });
    }
  }

  /**
   * Removes a recipe from the user's cookbook.
   * @param {any} response - The response object to send data back to the client.
   * @param {string} userId - The ID of the user.
   * @param {string} recipeId - The ID of the recipe to remove.
   * @returns {Promise<void>}
   */
  public async removeRecipeFromCookbook(
    response: any,
    userId: string,
    recipeId: string
  ): Promise<void> {
    try {
      const cookbook = await this.model.findOne({ user_ID: userId }).exec();
      if (!cookbook) {
        return response.status(404).json({ error: "Cookbook not found" });
      }

      const recipeIndex = cookbook.modified_recipes.findIndex(
        (id: mongoose.Types.ObjectId) => id.toString() === recipeId
      );

      if (recipeIndex === -1) {
        return response
          .status(404)
          .json({ error: "Recipe not found in cookbook" });
      }

      cookbook.modified_recipes.splice(recipeIndex, 1);
      await cookbook.save();

      response.json({
        message: `Modified recipe with ID ${recipeId} deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to remove recipe from the cookbook:", error);
      response
        .status(500)
        .json({ error: "Failed to remove recipe from cookbook" });
    }
  }

  // ############################### above is fixed

  /**
   * Adds a new version to an existing recipe in the user's cookbook.
   * @param {any} response - The response object to send data back to the client.
   * @param {string} userId - The ID of the user.
   * @param {string} recipeId - The ID of the recipe to add a new version to.
   * @param {any} versionData - The data for the new version to add.
   * @returns {Promise<void>}
   */
  public async addRecipeVersion(
    response: any,
    userId: string,
    recipeId: string,
    versionData: any
  ): Promise<void> {
    try {
      const result = await this.model
        .findOneAndUpdate(
          { user_ID: userId, "modified_recipes._id": recipeId },
          { $push: { "modified_recipes.$.versions": versionData } },
          { new: true }
        )
        .exec();
      response.json(result);
    } catch (error) {
      console.error("Failed to add recipe version:", error);
      response.status(500).json({ error: "Failed to add recipe version" });
    }
  }

  /**
   * Removes a version or the entire recipe.
   * @param {any} response - The response object to send data back to the client.
   * @param {string} userId - The ID of the user.
   * @param {string} recipeId - The ID of the recipe to remove.
   * @param {number} [versionNumber] - The specific version number to remove, if provided.
   * @returns {Promise<void>}
   */
  public async removeRecipeVersion(
    response: any,
    userId: string,
    recipeId: string,
    versionNumber?: number
  ): Promise<void> {
    try {
      const updateQuery = versionNumber
        ? {
            $pull: {
              "modified_recipes.$.versions": { version_number: versionNumber },
            },
          }
        : { $pull: { modified_recipes: { _id: recipeId } } };

      const result = await this.model
        .updateOne({ user_ID: userId }, updateQuery)
        .exec();

      response.json({
        message: versionNumber
          ? `Version ${versionNumber} removed from recipe ${recipeId}`
          : `Recipe ${recipeId} and all versions removed`,
        result,
      });
    } catch (error) {
      console.error("Failed to remove recipe/version:", error);
      response.status(500).json({ error: "Failed to remove recipe/version" });
    }
  }

  /**
   * Retrieves all recipes from a user's cookbook.
   * @param {any} response - The response object to send data back to the client.
   * @param {string} userId - The ID of the user whose cookbook is being retrieved.
   * @returns {Promise<void>}
   */
  public async getAllCookbookRecipes(
    response: any,
    userId: string
  ): Promise<void> {
    try {
      // Find the user's cookbook and populate the `modified_recipes` field
      const cookbook = await this.model
        .findOne({ user_ID: userId })
        .populate("modified_recipes")
        .exec();

      // If the cookbook doesn't exist, send an empty array
      if (!cookbook) {
        return response.json([]);
      }

      // Return all recipes in the cookbook (could be empty)
      response.json(cookbook.modified_recipes);
    } catch (error) {
      console.error("Failed to retrieve all recipes in the cookbook:", error);
      response.status(500).json({ error: "Failed to retrieve recipes." });
    }
  }
}

export { CookbookModel };
