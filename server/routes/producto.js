const express = require('express');
const {verificaToken, verificarAdmin_Role} = require('../middlewares/autenticacion');
const _ = require('underscore');

let app = express();
let Producto = require ('../models/producto');


//=======================
// OBTENER LOS PRODUCTOS
//=======================
app.get('/producto', verificaToken, (req,res)=>{
    //populate = usuarios y categoria
    //paginado
    Producto.find({disponible:true})
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria','descripcion')
        .exec((err,productosDB)=>{

            if (err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                productosDB
            })
    });
});

//===========================
// OBTENER UN PRODUCTO POR ID
//===========================
app.get('/producto/:id', verificaToken, (req,res)=>{
    //populate = usuarios y categoria
    //paginado
    let id = req.params.id;
    
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria','nombre')
        .exec((err,productoDB)=>{
            if (err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            if(!productoDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:"El id no es correcto"
                    }
                });
            }
            res.json({
                ok:true,
                producto: productoDB
            });
        })
});

//===========================
// CREAR UN PRODUCTO 
//===========================
app.post('/producto', verificaToken ,(req,res)=>{
    let body = req.body
    
    let producto = new Producto({
        nombre:body.nombre,
        precioUni:body.precioUni,
        descripcion:body.descripcion,
        disponible:body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save( (err,productoBD)=>{
        
        if (err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.status(200).json({
            ok:true,
            producto:productoBD
        })

    });
    //grabar usuario
    //Grabar categoria del listado
});


//===========================
// ACTUALIZAR UN PRODUCTO 
//===========================
app.put('/producto/:id', verificaToken, (req,res)=>{
    //grabar usuario
    //Grabar categoria del listado
    let id= req.params.id;

    Producto.findById(id, (err,productoDB) =>{
        
        let body = req.body;

        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if (!productoDB){
            return res.status(500).json({
                ok:false,
                err:{
                    message:"Id no existe"
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;
        productoDB.precioUni = body.precioUni;
        
        productoDB.save((err,productoGuardado)=>{
            if (err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                producto:productoGuardado
            });
        });

    });

});


//===========================
// BORRAR UN PRODUCTO 
//===========================
app.delete('/producto/:id', [verificaToken,verificarAdmin_Role], (req,res)=>{
    //Borrado logico disponible en false
    let id = req.params.id;
    
    Producto.findById(id, (err,productoDB)=>{
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!productoDB){
            return res.status(500).json({
                ok:false,
                err:{
                    message:"El id no existe"
                }
            })
        }

        productoDB.disponible = false

        productoDB.save ((err,productoDB)=>{
            if (err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                producto:productoDB
            })
        })
    });
});

module.exports = app;