"use strict";
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
exports.App = void 0;
var express = require("express");
var bodyParser = require("body-parser"); // For parsing URL requests and JSON
var DiscoverModel_1 = require("./model/DiscoverModel");
var CookbookModel_1 = require("./model/CookbookModel");
var UserModel_1 = require("./model/UserModel"); // Import the UserModel
var cookieParser = require("cookie-parser");
var session = require("express-session");
var passport = require("passport");
var GooglePassport_1 = require("./GooglePassport");
var App = /** @class */ (function () {
    function App(mongoDBConnection) {
        this.googlePassportObj = new GooglePassport_1["default"]();
        this.expressApp = express();
        this.DiscoverModel = new DiscoverModel_1.DiscoverModel(mongoDBConnection); // Single instance
        this.Cookbook = new CookbookModel_1.CookbookModel(mongoDBConnection, this.DiscoverModel);
        this.UserModel = new UserModel_1.UserModel(mongoDBConnection, this.Cookbook); // Pass the shared instance
        this.middleware();
        this.routes();
    }
    App.prototype.validateAuth = function (req, res, next) {
        if (req.isAuthenticated()) {
            console.log("User is authenticated");
            return next();
        }
        console.log("User is not authenticated");
        res.status(401).json({ error: "Unauthorized" });
    };
    App.prototype.middleware = function () {
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "http://localhost:4200");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });
        this.expressApp.use(cookieParser());
        this.expressApp.use(session({
            secret: "1234567890QWERTY",
            resave: false,
            saveUninitialized: true
        }));
        this.expressApp.use(passport.initialize());
        this.expressApp.use(passport.session());
    };
    App.prototype.routes = function () {
        var _this = this;
        var router = express.Router();
        router.get("/app/discover", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DiscoverModel.retrieveAllRecipes(res)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/discover/:recipeID", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var recipeID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recipeID = req.params.recipeID;
                        return [4 /*yield*/, this.DiscoverModel.retrieveRecipe(res, recipeID)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        router.post("/app/discover", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var newRecipeData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newRecipeData = req.body;
                        return [4 /*yield*/, this.DiscoverModel.createRecipe(res, newRecipeData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        router["delete"]("/app/discover/:recipeID", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var recipeID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recipeID = req.params.recipeID;
                        return [4 /*yield*/, this.DiscoverModel.deleteRecipe(res, recipeID)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Add a new recipe to the cookbook collection from Discover
        router.post("/app/discover/transfer", this.validateAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var recipeIDs, userId, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("here in app");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        recipeIDs = Object.values(req.body)[0];
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        console.log("Request Body:", req.body);
                        console.log(typeof recipeIDs);
                        console.log(typeof Object.values(recipeIDs[0]));
                        console.log(recipeIDs[0]);
                        console.log(typeof recipeIDs[0][0]);
                        // console.log("recIDS:", recipeIDs.type());
                        // Validate input
                        if (!Array.isArray(recipeIDs) || recipeIDs.length === 0) {
                            return [2 /*return*/, res.status(400).json({ error: "Invalid recipe IDs" })];
                        }
                        // Extract user_ID from req.user
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        return [4 /*yield*/, this.Cookbook.copyRecipesFromDiscover(res, recipeIDs, userId)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error(error_1);
                        res.status(500).json({ error: "error adding recipes to cookbook" });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/cookbook", this.validateAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        return [4 /*yield*/, this.Cookbook.getAllCookbookRecipes(res, userId)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error("Error getting cookbook:", error_2);
                        res
                            .status(500)
                            .json({ error: "An error occurred while retrieving the cookbook." });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
        router.get("/app/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var googleUser, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        googleUser = req.user;
                        return [4 /*yield*/, this.UserModel.findOrCreateUser(googleUser)];
                    case 1:
                        user = _a.sent();
                        console.log("User successfully authenticated:", user);
                        res.redirect("http://localhost:4200/discover");
                        return [2 /*return*/];
                }
            });
        }); });
        router.get("/app/auth/check", this.validateAuth, function (req, res) {
            if (req.isAuthenticated()) {
                res.json({ loggedIn: true });
            }
            else {
                res.json({ loggedIn: false });
            }
        });
        router.get("/app/profile", this.validateAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, userProfile, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        return [4 /*yield*/, this.UserModel.getUserProfile(userId)];
                    case 1:
                        userProfile = _b.sent();
                        if (!userProfile) {
                            res.status(404).json({ error: "User not found" });
                        }
                        else {
                            res.json(userProfile);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error("Error retrieving profile:", error_3);
                        res
                            .status(500)
                            .json({ error: "An error occurred while retrieving the profile." });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.expressApp.use("/", router);
    };
    return App;
}());
exports.App = App;
