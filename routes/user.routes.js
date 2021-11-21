"use strict";

const express = require("express");
const userController = require("../controllers/user.controller");
const mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.post("/login", userController.login);
api.post("/createCompany", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.createCompany);
api.put("/updateCompany/:id", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.updateCompany);
api.delete("/removeCompany/:id", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.removeCompany);
api.get("/getCompanys", [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getCompanys);
api.get("/getCompanyById", [mdAuth.ensureAuth], userController.getCompany);

module.exports = api;