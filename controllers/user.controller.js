"use strict"

const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");

const User = require("../models/user.model");
const ObjectId = require('mongoose').Types.ObjectId;

function userAdmin() {
    var user = new User();

    User.findOne({ username: "AdminMc" }, (err, adminFinded) => {
        if (err) {
            console.log(err);
        } else if (adminFinded) {
            console.log("Usuario admin ya fue creado");
        } else {
            bcrypt.hash("123456", null, null, (err, passwordHashed) => {
                if (err) {
                    console.log("Error al encriptar contraseña de admin");
                } else if (passwordHashed) {
                    user.password = passwordHashed;
                    user.name = "AdminMc";
                    user.username = "AdminMc";
                    user.role = "ROLE_ADMIN";
                    user.save((err, userSaved) => {
                        if (err) {
                            console.log("Error al crear usuario admin");
                        } else if (userSaved) {
                            console.log("Usuario admin creado exitosamente");
                        } else {
                            console.log("No se creó el usuario admin");
                        }
                    });
                } else {
                    console.log("Contraseña de admin no encriptada");
                }
            });
        }
    });
}

function login(req,res){
    var params = req.body;
    
    if(params.username && params.password){
        User.findOne({username: params.username}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettoken){
                            return res.send({ token: jwt.createToken(userFind), user: userFind});
                        }else{
                            return res.send({ message: 'Usuario logeado', user:userFind});
                        }
                    }else{
                        return res.status(401).send({message: 'Contraseña incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'Usuario inexistente'});
            }
        })
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function createCompany(req,res){
    var user = new User();
    var params = req.body;

    User.findOne({username: params.username},(err,userFinded)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar empresa"});
        }else if(userFinded){
            return res.send({message: "Empresa ya existente"});
        }else{
            if(params.name && params.username && params.password && params.email && params.phone){
                bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                    if (err) {
                        return res.status(500).send({message: "Error al encriptar contraseña"});
                    } else if (passwordHashed) {
                        user.password = passwordHashed;
                        user.name = params.name;
                        user.username = params.username;
                        user.email = params.email;
                        user.phone = params.phone;
                        user.direccionSucursal = params.direccionSucursal;
                        user.save((err, userSaved) => {
                            if (err) {
                                return res.status(500).send({message: "Error al agregar empresa"});
                            } else if (userSaved) {
                                return res.send({message: "Empresa agregada exitosamente",userSaved});
                            } else {
                                return res.status(500).send({message: "No se agregó la empresa"});
                            }
                        });
                    } else {
                        console.log("Contraseña de admin no encriptada");
                    }
                });
            }else{
                return res.send({message: "Ingrese los datos mínimos para crear una empresa"});
            }
        }
    })
}

function updateCompany(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(update.password){
        return res.status(401).send({ message: 'No se puede actualizar la contraseña'});
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(500).send({ message: 'Error general'});
            }else if(userFind){
                User.findOne({username: update.username},(err,userFinded)=>{
                    if(err){
                        return res.status(500).send({message: "Error al buscar nombre de usuario"});
                    }else if(userFinded){
                        if(userFinded.username == update.username){
                            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    return res.send({message: 'Sucursal actualizada', userUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar la Sucursal'});
                                }
                            })
                        }else{
                            return res.send({message: "Nombre de usuario ya en uso"});
                        }
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Sucursal actualizada', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar la Sucursal'});
                            }
                        })
                    }
                })
            }else{
                return res.send({message: "Sucursal inexistente"});
            }
        })
    }
    
}

function removeCompany(req,res){
    var userId = req.params.id;

    User.findById(userId,(err,userFinded)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar Sucursal"});
        }else if(userFinded){
            User.findByIdAndRemove(userId,(err,userRemoved)=>{
                if(err){
                    return res.status(500).send({message: "Error al eliminar Sucursal"});
                }else if(userRemoved){
                    return res.send({message: "Sucursal eliminada exitosamente",userRemoved});
                }else{
                    return res.status(500).send({message: "No se eliminó la Sucursal"});
                }
            })
        }else{
            return res.send({message: "Sucursal inexistente o ya fue eliminada"});
        }
    })
}

function getCompanys(req,res){
    User.find({role: "ROLE_EMPRESA"}).exec((err,users)=>{
        if(err){
            return res.status(500).send({message: "Error al obtener Sucursales"});
        }else if(users){
            return res.send({message: "Sucursales", users});
        }else{
            return res.send({message: "No hay Sucursales"});
        }
    })
}

function getCompany(req, res) {
    let idCompany = req.headers.id;

    User.findOne({_id:ObjectId(idCompany)}).exec((err,users)=>{
        if(err){
            return res.status(500).send({message: "Error al obtener la sucursal"});
        }else if(users){
            return res.send({message: "Sucursal", data: users});
        }else{
            return res.send({message: "No hay sucursales"});
        }
    })
}

module.exports = {
    userAdmin,
    login,
    createCompany,
    updateCompany,
    removeCompany,
    getCompanys,
    getCompany
}