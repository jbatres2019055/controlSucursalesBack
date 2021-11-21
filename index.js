'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3200;
var admin = require("./controllers/user.controller");

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/ControlSucursal', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
            console.log('Conectado a la Base de Datos');
            app.listen(port, ()=>{
                admin.userAdmin();
                console.log('Servidor de Express en ejecución');
            })
    })
    .catch((err)=>{ console.log('Error al conectarse a la Base de Datos', err)})