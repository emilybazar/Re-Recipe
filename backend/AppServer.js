"use strict";
exports.__esModule = true;
var express = require('express');
var path = require('path');
var dotenv = require("dotenv");
var cookieParser = require("cookie-parser");
var App_1 = require("./App");
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
var port = process.env.PORT || 8080;
var mongoDBConnection = process.env.DB_INFO;
console.log("server db connection URL " + mongoDBConnection);
console.log("process.env.DB_INFO " + process.env.DB_INFO);
var server = new App_1.App(mongoDBConnection).expressApp;
server.use(cookieParser());
var cors = require('cors');
server.use(cors({
    origin: 'http://localhost:4200',
    credentials: true // Allow sending cookies with requests
}));
server.listen(port, function () {
    console.log("server running on port ".concat(port));
});
