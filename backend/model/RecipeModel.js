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
exports.RecipeModel = void 0;
var mongoose_1 = require("mongoose");
var RecipeContents_1 = require("./RecipeContents");
var RecipeModel = /** @class */ (function () {
    function RecipeModel() {
        this.createSchema();
        this.createModel();
    }
    // Create the schema for the Recipe model
    RecipeModel.prototype.createSchema = function () {
        var schemaDefinition = {
            recipe_ID: {
                type: mongoose_1["default"].Schema.Types.ObjectId,
                required: true,
                ref: "Recipe"
            },
            recipe_name: { type: String, required: true },
            meal_category: { type: [String], required: true },
            recipe_versions: [
                { type: mongoose_1["default"].Schema.Types.ObjectId, ref: "RecipeContents" }
            ],
            image_url: { type: String },
            is_visible: { type: Boolean, "default": false },
            modified_flag: { type: Boolean },
            user_ID: { type: String, required: true }
        };
        this.schema = new mongoose_1["default"].Schema(schemaDefinition);
    };
    // Create the Recipe model
    RecipeModel.prototype.createModel = function () {
        this.recipe = mongoose_1["default"].models.Recipe || mongoose_1["default"].model("Recipe", this.schema);
    };
    // Create a new recipe version
    RecipeModel.prototype.createRecipeVersion = function (recipe, recipe_contents_data) {
        return __awaiter(this, void 0, void 0, function () {
            var new_version_number, existingRecipeContents, newRecipeContents, savedRecipeContents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        new_version_number = recipe.recipe_versions.length + 1;
                        return [4 /*yield*/, RecipeContents_1.RecipeContentsModel.findOne({
                                recipe_ID: recipe.recipe_ID,
                                version_number: new_version_number
                            })];
                    case 1:
                        existingRecipeContents = _a.sent();
                        if (existingRecipeContents) {
                            console.log("Recipe version ".concat(new_version_number, " already exists for recipe ").concat(recipe.recipe_ID));
                            return [2 /*return*/, recipe]; // Skip creating a new version
                        }
                        newRecipeContents = new RecipeContents_1.RecipeContentsModel(__assign(__assign({}, recipe_contents_data), { version_number: new_version_number }));
                        return [4 /*yield*/, newRecipeContents.save()];
                    case 2:
                        savedRecipeContents = _a.sent();
                        recipe.recipe_versions.push(savedRecipeContents._id);
                        return [2 /*return*/, recipe];
                }
            });
        });
    };
    // Reusable method for aggregation across different collections
    RecipeModel.prototype.getRecipesWithContents = function (collection, matchConditions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, collection.aggregate([
                            {
                                $match: matchConditions
                            },
                            {
                                $lookup: {
                                    from: "recipe_contents",
                                    localField: "recipe_versions",
                                    foreignField: "recipe_ID",
                                    as: "recipe_contents"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$recipe_contents",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    recipe_name: 1,
                                    meal_category: 1,
                                    recipe_versions: 1,
                                    recipe_contents: 1
                                }
                            }
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return RecipeModel;
}());
exports.RecipeModel = RecipeModel;
