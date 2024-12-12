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
exports.UserModel = void 0;
var mongoose = require("mongoose");
var UserModel = /** @class */ (function () {
    function UserModel(DB_CONNECTION_STRING, cookbookModel) {
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.cookbookModel = cookbookModel; // Use the passed instance
        this.createSchema();
        this.createModel();
    }
    UserModel.prototype.createSchema = function () {
        this.schema = new mongoose.Schema({
            user_ID: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            displayName: { type: String, required: true },
            color: { type: String, required: true, "default": "#000000" }
        }, { collection: "users", timestamps: true });
    };
    UserModel.prototype.createModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!!mongoose.connection.readyState) return [3 /*break*/, 2];
                        return [4 /*yield*/, mongoose.connect(this.dbConnectionString)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.model = mongoose.model("User", this.schema);
                        console.log("Connected to MongoDB and created User model.");
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error creating User model:", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.ensureCookbookExists = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var cookbookExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cookbookModel.model
                            .findOne({ user_ID: userId })
                            .exec()];
                    case 1:
                        cookbookExists = _a.sent();
                        if (!!cookbookExists) return [3 /*break*/, 3];
                        console.log("No cookbook found for user_ID: ".concat(userId, ". Creating one."));
                        return [4 /*yield*/, this.cookbookModel.createCookbook(userId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        console.log("Cookbook already exists for user_ID: ".concat(userId));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var newUser, savedUser, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log("Creating new user with data:", userData);
                        newUser = new this.model({
                            user_ID: userData.user_ID,
                            email: userData.email,
                            displayName: userData.displayName
                        });
                        return [4 /*yield*/, newUser.save()];
                    case 1:
                        savedUser = _a.sent();
                        console.log("New user created:", savedUser);
                        return [4 /*yield*/, this.ensureCookbookExists(savedUser.user_ID)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, savedUser];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error creating user:", error_2);
                        throw new Error("User creation failed.");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.findOrCreateUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        console.log("Finding or creating user with data:", userData);
                        return [4 /*yield*/, this.model.findOne({ user_ID: userData.user_ID }).exec()];
                    case 1:
                        user = _a.sent();
                        if (!!user) return [3 /*break*/, 3];
                        console.log("User not found. Creating new user.");
                        return [4 /*yield*/, this.createUser(userData)];
                    case 2:
                        user = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        console.log("User already exists:", user);
                        _a.label = 4;
                    case 4:
                        console.log("Ensuring cookbook exists for user_ID: ".concat(user.user_ID));
                        return [4 /*yield*/, this.ensureCookbookExists(user.user_ID)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, user];
                    case 6:
                        error_3 = _a.sent();
                        console.error("Error during find or create user:", error_3);
                        throw new Error("User lookup or creation failed.");
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.updateUser = function (userId, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedUser, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Updating user:", userId, "with data:", updateData);
                        return [4 /*yield*/, this.model
                                .findOneAndUpdate({ user_ID: userId }, updateData, { "new": true })
                                .exec()];
                    case 1:
                        updatedUser = _a.sent();
                        if (!updatedUser) {
                            console.error("User not found for update.");
                            return [2 /*return*/, null];
                        }
                        console.log("User updated:", updatedUser);
                        return [2 /*return*/, updatedUser];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error updating user:", error_4);
                        throw new Error("Error updating user profile.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.deleteUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Deleting user with ID:", userId);
                        return [4 /*yield*/, this.model.deleteOne({ user_ID: userId }).exec()];
                    case 1:
                        result = _a.sent();
                        if (result.deletedCount === 0) {
                            console.error("User not found for deletion.");
                            return [2 /*return*/, false];
                        }
                        console.log("User deleted successfully.");
                        return [2 /*return*/, true];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error deleting user:", error_5);
                        throw new Error("Error deleting user.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.listAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Listing all users.");
                        return [4 /*yield*/, this.model.find({}).exec()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error listing users:", error_6);
                        throw new Error("Error retrieving user list.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserModel.prototype.getUserProfile = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Fetching user profile for ID:", userId);
                        return [4 /*yield*/, this.model
                                .findOne({ user_ID: userId })
                                .select("displayName email user_ID color")
                                .exec()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error fetching user profile:", error_7);
                        throw new Error("User profile fetch failed.");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return UserModel;
}());
exports.UserModel = UserModel;
