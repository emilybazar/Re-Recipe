"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var App_1 = require("./App");
dotenv.config();
var port = process.env.PORT;
var dbUser = process.env.DB_USER;
var dbPassword = process.env.DB_PASSWORD;
var mongoDBConnection = 'mongodb://' + dbUser + ':' + encodeURIComponent(dbPassword) + process.env.DB_INFO;
console.log("dbUser " + dbUser);
console.log("dbPassword " + dbPassword);
console.log("server db connection URL " + mongoDBConnection);
console.log("process.env.DB_INFO" + process.env.DB_INFO);
var server = new App_1.App(mongoDBConnection).expressApp;
server.listen(port);
console.log("server running in port " + port);
