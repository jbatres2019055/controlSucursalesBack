"use strict"

const Product = require("../models/product.model");
const User = require("../models/user.model");
const ObjectId = require('mongoose').Types.ObjectId;

function addProduct(req,res){
    var params = req.body;
    var userId = req.user.sub;
    var product = new Product();

    if(params.name && params.supplier && params.stock){
        product.name = params.name;
        product.supplier = params.supplier;
        product.stock = params.stock;
        product.save((err,productSaved)=>{
            if(err){
                return res.status(500).send({message: "Error al crear producto"});
            }else if(productSaved){
                User.findByIdAndUpdate(userId, {$push: {products: productSaved._id}},{new: true},(err,userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: "Error al añadir producto"});
                    }else if(userUpdated){
                        return res.send({message: "Producto creado y agregado exitosamente", productSaved});
                    }else{
                        return res.status(500).send({message: "No se pudo añadir el producto a la empresa"});
                    }
                })
            }else{
                return res.status(500).send({message: "No se creó el producto"});
            }
        })
    }else{
        return res.send({message: "Ingrese los datos mínimos para crear un producto"});
    }
}

function updateProduct(req,res){
    var productId = req.params.id;
    var update = req.body;
    
    Product.findByIdAndUpdate(productId, update,{new: true},(err,productUpdated)=>{
        if(err){
            return res.status(500).send({message: "Error al actualizar producto"});
        }else if(productUpdated){
            return res.send({message: "Producto actualizado", productUpdated});
        }else{
            return res.status(500).send({message: "Producto inexistente"});
        }
    })
}

function removeProduct(req,res){
    var productId = req.params.id;
    var userId = req.user.sub;

    User.findById(userId,(err,userFinded)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar empresa"});
        }else if(userFinded){
            if(userFinded.products.includes(productId)){
                User.findByIdAndUpdate(userId,{$pull: {products: productId}},{new: true},(err,userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: "Error al eliminar producto de empresa"});
                    }else if(userUpdated){
                        Product.findByIdAndRemove(productId,(err,productRemoved)=>{
                            if(err){
                                return res.status(500).send({message: "Error al eliminar producto"});
                            }else if(productRemoved){
                                return res.send({message: "Producto eliminado exitosamente"});
                            }else{
                                return res.status(500).send({message: "No se eliminó el producto"});
                            }
                        })
                    }else{
                        return res.status(500).send({message: "No se eliminó el producto de la empresa"});
                    }
                })
            }else{
                Product.findByIdAndRemove(productId,(err,productRemoved)=>{
                    if(err){
                        return res.status(500).send({message: "Error al eliminar producto"});
                    }else if(productRemoved){
                        return res.send({message: "Producto eliminado exitosamente"});
                    }else{
                        return res.status(500).send({message: "No se eliminó el producto"});
                    }
                })
                //return res.status(401).send({message: "El producto no pertenece a esta empresa, no existe o ya fue eliminado"});
            }
        }else{
            return res.status(404).send({message: "Empresa inexistente"});
        }
    })
}

function getProducts(req,res){
    var userId = req.user.sub;
    let type = 1;
    // User.findById(userId, ((err,userFinded)=>{
    //     if(err){
    //         return res.status(500).send({message: "Error al obtener productos"});
    //     }else if(userFinded){
    //         let products = userFinded.products;
    //         return res.send({message: "Productos ", products});
    //     }else{
    //         return res.status(500).send({message: "No hay productos"});
    //     }
    // }))
    if (req.params.type) {
        if (req.params.type == 'Descendente') type = 1;
        else type = -1;
        Product.find({}, (err, response) => {
            if(err){
                return res.status(500).send({message: "Error al obtener productos"});
            }else if(response){
                let products = response;
                return res.send({message: "Productos ", products});
            }else{
                return res.status(500).send({message: "No hay productos"});
            }
        }).sort({'stock':type})
    }
}

function buyProduct(req,res){
    let productId = req.params.id;
    var params = req.body;

    if(params.stock){
        Product.findById(productId,(err,productFinded)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar producto"});
            }else if(productFinded){
                if(productFinded.stock < params.stock){
                    return res.send({message: "Cantidad de producto insuficiente para su pedido"});
                }else{
                    var stock = productFinded.stock - parseInt(params.stock);
                    var cantidad = productFinded.sales + parseInt(params.stock);
                    Product.findByIdAndUpdate(productId,{stock: stock, sales: cantidad},{new:true},(err,productUpdated)=>{
                        if(err){
                            return res.status(500).send({message: "Error al actualizar producto"});
                        }else if(productUpdated){
                            return res.send({message: "Producto adquirido exitosamente", productUpdated});
                        }else{
                            return res.status(500).send({message: "No se adquirió el producto"});
                        }
                    })
                }
            }else{
                return res.send({message: "Producto inexistente"});
            }
        })
    }else{
        return res.send({message: "Ingrese la cantidad a comprar"});
    }
}

function sendProduct (req, res) {
    let productId = req.params.id;
    let params = req.body.data;
    params.stock = parseInt(params.stock);

    if (params.stock && params.stock >= 1) {
        if (params.office) {
            Product.findOne({_id:productId}, (err, prod) => {
                if(err){
                    return res.status(500).send({message: "Error al buscar producto"});
                }else if (prod){
                    if (prod.stock >= params.stock) {
                        Product.findByIdAndUpdate(productId, { $inc : { 'stock' : (-params.stock) } }, (err, restStock) => {
                            let products = [];
                            if (params.office.products.length >= 1) products = params.office.products.filter(item => item._id === params.product);
                            if (products.length < 1 || products.length === 0) {
                                console.log('prod: ', prod.supplier)
                                User.findByIdAndUpdate(ObjectId(params.office._id), { $push : { 'products' : {_id:productId,stock:params.stock,name:prod.name,supplier:prod.supplier} } }, (err, userUpd) => {
                                    if(err){
                                        return res.status(500).send({message: "Error al actualizar la sucursal"});
                                    }else if(userUpd){
                                        return res.status(200).send({message: "Producto enviado correctamente", success:true});
                                    }else{
                                        return res.status(500).send({message: "No se adquirió la sucursal"});
                                    }
                                });
                            } else {
                                User.findOneAndUpdate({ _id : ObjectId(params.office._id), 'products._id' : productId }, {$inc:{'products.$.stock':params.stock}}, (err, incStock) => {
                                    if(err){
                                        return res.status(500).send({message: "Error al actualizar la sucursal"});
                                    }else return res.status(200).send({message: "Producto enviado correctamente", success:true});
                                })
                            }
                        });
                    } else return res.send({message: "Ingrese solo cantidades existentes"});
                }
            });
        } else return res.send({message: "Seleccione una sucursal"});
    } else {
        return res.send({message: "Ingrese la cantidad a enviar"});
    }
}

function sellProduct (req, res) {
    let data = req.body.data;
    data['stockTemp'] = parseInt(data['stockTemp']);
    let idCompany = req.headers.id;
    console.log('data: ', data, 'idCompany:', idCompany);

    if (data.stockTemp) {
        let stages = [{ $match:{_id:ObjectId(idCompany)}},{$unwind:'$products'},{$match:{'products._id':ObjectId(data._id)}}];
        User.aggregate(stages).exec((err, prods) => {
            console.log('prods: ', prods)
            if(err){
                return res.status(500).send({message: "Error al buscar producto"});
            }else if(prods && prods.length >= 1){
                if (prods[0].products.stock >= data.stockTemp){
                    console.log('todo bien')
                    User.findOneAndUpdate({ _id : ObjectId(idCompany), 'products._id' : ObjectId(data._id) }, {$inc:{'products.$.stock':(-data['stockTemp']), 'products.$.stockSelled': data['stockTemp']}}, (err, incStock) => {
                        if(err){
                            return res.status(500).send({message: "Error al actualizar el inventario"});
                        }else return res.status(200).send({message: "Producto vendido correctamente", success:true});
                    })
                } else return res.send({message: "Ingrese solo cantidades existentes"});
            }
        });
    } else return res.send({message: "Ingrese la cantidad a vender"});
}

function getProductsMoreSelled (req, res) {
    let idCompany = req.headers.id;
    let type = req.params.type;
    let stages = [{$match:{'_id':ObjectId(idCompany)}},{$unwind:'$products'}];
    if (type == 'Ascendente') stages.push({$sort:{'products.stockSelled':-1}})
    else stages.push({$sort:{'products.stockSelled':1}})
    User.aggregate(stages).exec((err, prods) => {
        if(err){
            return res.status(500).send({message: "Error al buscar productos"});
        }else {
            return res.status(200).send({message: "Productos buscados", data:prods});
        }
    });
}

module.exports = {
    addProduct,
    updateProduct,
    removeProduct,
    getProducts,
    buyProduct,
    sendProduct,
    sellProduct,
    getProductsMoreSelled
} 