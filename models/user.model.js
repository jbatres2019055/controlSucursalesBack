'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    id: Number,
    name: String,
    username: String,
    password: String,
    email: String,
    phone: Number,
    direccionSucursal: String,
    role: {type: String, default: "ROLE_EMPRESA"},
    employees: [{type: Schema.ObjectId, ref: 'employee'}],
    products: [{
        _id: Schema.ObjectId,
        name: String,
        stock: Number,
        stockSelled: Number,
        supplier: String
    }]
});

module.exports = mongoose.model('user', userSchema);