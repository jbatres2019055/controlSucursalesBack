'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = Schema({
    name: String,
    supplier: String,
    stock: Number,
    sales: {type: Number, default: 0}
});

module.exports = mongoose.model('product', productSchema);