"use strict";

const express = require("express");
const productController = require("../controllers/product.controller");
const mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.put("/addProduct", [mdAuth.ensureAuth], productController.addProduct);
api.put("/updateProduct/:id", [mdAuth.ensureAuth], productController.updateProduct);
api.put("/removeProduct/:id", [mdAuth.ensureAuth], productController.removeProduct);
api.get("/getProducts/:type", [mdAuth.ensureAuth], productController.getProducts);
api.put("/buyProduct/:id", [mdAuth.ensureAuth], productController.buyProduct);
api.put("/sendProduct/:id", [mdAuth.ensureAuth], productController.sendProduct);
api.put("/sellProduct/:id", [mdAuth.ensureAuth], productController.sellProduct);
api.get("/getProductsMoreSelled/:type", [mdAuth.ensureAuth], productController.getProductsMoreSelled)

module.exports = api;