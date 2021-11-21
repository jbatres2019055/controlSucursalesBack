'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'controlSucursales';

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(8, 'hours').unix()
    }
    return jwt.encode(payload, secretKey);
}