"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.DiscoverModel = void 0;
var mongoose = require("mongoose");
var RecipeModel_1 = require("./RecipeModel");
var RecipeContents_1 = require("./RecipeContents");
var ObjectId = require('mongodb').ObjectId;
var DiscoverModel = /** @class */ (function () {
    function DiscoverModel(DB_CONNECTION_STRING) {
        this.recipeModel = new RecipeModel_1.RecipeModel();
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.createSchema();
        this.createModel();
    }
    DiscoverModel.prototype.createSchema = function () {
        this.schema = new mongoose.Schema({
            recipeList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
            modified_flag: { type: Boolean, "default": false },
            user_ID: { type: String, required: true },
            recipe_ID: { type: mongoose.Schema.Types.ObjectId, required: true },
            recipe_name: { type: String, required: true },
            meal_category: [{ type: String }],
            recipe_versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecipeContents" }],
            image_url: { type: String, required: true },
            is_visible: { type: Boolean, "default": false }
        }, { collection: "discover" });
    };
    DiscoverModel.prototype.createModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, mongoose.connect(this.dbConnectionString)];
                    case 1:
                        _a.sent();
                        this.model =
                            mongoose.models.Discover || mongoose.model("Discover", this.schema);
                        console.log("Connected to MongoDB and initialized Discover model.");
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error("Error connecting to MongoDB or initializing Discover model:", e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiscoverModel.prototype.createRecipe = function (response, recipeData) {
        return __awaiter(this, void 0, void 0, function () {
            var savedRecipe, recipeIdObjectId, existingRecipe, newRecipe, recipeVersion, savedRecipeContents, newDiscoverDocument, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        console.log("Creating recipe with data:", recipeData);
                        savedRecipe = void 0;
                        recipeIdObjectId = new mongoose.Types.ObjectId();
                        return [4 /*yield*/, this.recipeModel.recipe.findOne({
                                recipe_ID: recipeIdObjectId
                            })];
                    case 1:
                        existingRecipe = _a.sent();
                        if (!existingRecipe) return [3 /*break*/, 2];
                        savedRecipe = existingRecipe;
                        console.log("Recipe already exists:", savedRecipe);
                        return [3 /*break*/, 6];
                    case 2:
                        newRecipe = new this.recipeModel.recipe(__assign(__assign({}, recipeData), { recipe_ID: recipeIdObjectId, modified_flag: false }));
                        console.log("Saving new recipe:", newRecipe);
                        return [4 /*yield*/, newRecipe.save()];
                    case 3:
                        savedRecipe = _a.sent();
                        console.log("New Recipe saved:", savedRecipe);
                        recipeVersion = new RecipeContents_1.RecipeContentsModel({
                            recipe_ID: savedRecipe._id,
                            user_ID: recipeData.user_ID,
                            cooking_duration: recipeData.cooking_duration || 25,
                            serving_size: recipeData.serving_size || 4,
                            ingredients: recipeData.ingredients || [],
                            directions: recipeData.directions || [],
                            version_number: 0
                        });
                        console.log("Creating new recipe version:", recipeVersion);
                        return [4 /*yield*/, recipeVersion.save()];
                    case 4:
                        savedRecipeContents = _a.sent();
                        console.log("New Recipe version saved:", savedRecipeContents);
                        // Add the saved recipe contents to the recipe's versions array
                        savedRecipe.recipe_versions.push(savedRecipeContents._id);
                        return [4 /*yield*/, savedRecipe.save()];
                    case 5:
                        _a.sent();
                        console.log("Recipe version added to recipe:", savedRecipe.recipe_versions);
                        _a.label = 6;
                    case 6:
                        newDiscoverDocument = new this.model({
                            recipeList: [savedRecipe._id],
                            modified_flag: false,
                            user_ID: recipeData.user_ID || "user005",
                            recipe_ID: recipeIdObjectId,
                            recipe_name: recipeData.recipe_name || savedRecipe.recipe_name,
                            meal_category: recipeData.meal_category || [],
                            recipe_versions: savedRecipe.recipe_versions || [],
                            image_url: recipeData.image_url || "https://www.the-sun.com/wp-content/uploads/sites/6/2020/08/tp-graphic-rihanna-chef.jpg",
                            is_visible: recipeData.is_visible !== undefined ? recipeData.is_visible : false
                        });
                        console.log("Creating new Discover document:", newDiscoverDocument);
                        return [4 /*yield*/, newDiscoverDocument.save()];
                    case 7:
                        _a.sent();
                        console.log("New Discover document saved:", newDiscoverDocument);
                        response.status(201).json(savedRecipe);
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        console.error("Error adding recipe to Discover:", error_1);
                        response.status(500).json({ error: "Failed to create new recipe" });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DiscoverModel.prototype.retrieveAllRecipes = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var discoverRecipes, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.model
                                .find({})
                                .populate('recipe_versions')
                                .exec()];
                    case 1:
                        discoverRecipes = _a.sent();
                        response.json(discoverRecipes);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error retrieving populated recipe:", error_2);
                        response.status(500).json({ error: "Failed to fetch recipes." });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiscoverModel.prototype.retrieveRecipe = function (response, recipe_ID) {
        return __awaiter(this, void 0, void 0, function () {
            var result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Fetching Discover document for recipe_ID with populated recipe versions:", recipe_ID);
                        return [4 /*yield*/, this.model
                                .findOne({ recipe_ID: recipe_ID })
                                .populate("recipe_versions")
                                .exec()];
                    case 1:
                        result = _a.sent();
                        if (result) {
                            response.json(result);
                        }
                        else {
                            response.status(404).json({ error: "Recipe not found" });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        console.error("Failed to retrieve recipe:", e_2);
                        response.status(500).json({ error: "Failed to retrieve recipe" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiscoverModel.prototype.deleteRecipe = function (response, recipe_ID) {
        return __awaiter(this, void 0, void 0, function () {
            var objectId, result, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        objectId = new ObjectId(recipe_ID);
                        return [4 /*yield*/, this.model.deleteOne({ _id: objectId }).exec()];
                    case 1:
                        result = _a.sent();
                        if (result.deletedCount > 0) {
                            response.json({ message: "Recipe ".concat(recipe_ID, " deleted successfully.") });
                        }
                        else {
                            response.status(404).json({ error: "Recipe not found" });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        console.error("Failed to delete recipe:", e_3);
                        response.status(500).json({ error: "Failed to delete recipe" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DiscoverModel;
}());
exports.DiscoverModel = DiscoverModel;
