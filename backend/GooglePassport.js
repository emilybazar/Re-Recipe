"use strict";
exports.__esModule = true;
var googleOauth2_1 = require("./googleOauth2");
var passport = require("passport");
var passport_google_oauth20_with_people_api_1 = require("passport-google-oauth20-with-people-api");
var GooglePassport = /** @class */ (function () {
    function GooglePassport() {
        this.clientId = googleOauth2_1["default"].id;
        this.secretId = googleOauth2_1["default"].secret;
        console.log("Google Client ID:", this.clientId);
        console.log("Google Secret ID:", this.secretId);
        // Dynamically set callback URL based on environment
        var callbackURL = process.env.NODE_ENV === "production"
            ? "https://your-deployed-site.azurewebsites.net/app/auth/google/callback"
            : "http://localhost:8080/app/auth/google/callback";
        passport.use(new passport_google_oauth20_with_people_api_1.Strategy({
            clientID: this.clientId,
            clientSecret: this.secretId,
            callbackURL: callbackURL
        }, function (accessToken, refreshToken, profile, done) {
            console.log("Inside new passport Google strategy");
            process.nextTick(function () {
                var _a, _b;
                var email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
                var user = {
                    id: profile.id,
                    user_ID: profile.id,
                    displayName: profile.displayName,
                    email: email || null
                };
                console.log("userId:", profile.id);
                console.log("displayName:", profile.displayName);
                return done(null, user);
            });
        }));
        passport.serializeUser(function (user, done) {
            done(null, user);
        });
        passport.deserializeUser(function (user, done) {
            done(null, user);
        });
    }
    return GooglePassport;
}());
exports["default"] = GooglePassport;
