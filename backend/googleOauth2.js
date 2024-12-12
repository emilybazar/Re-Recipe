"use strict";
exports.__esModule = true;
var dotenv = require("dotenv");
var path = require("node:path");
dotenv.config({ path: path.resolve(__dirname, '../.env') });
var googleOauth2 = /** @class */ (function () {
    function googleOauth2() {
    }
    googleOauth2.id = process.env.GOOGLE_CLIENT_ID;
    googleOauth2.secret = process.env.GOOGLE_CLIENT_SECRET;
    return googleOauth2;
}());
exports["default"] = googleOauth2;
