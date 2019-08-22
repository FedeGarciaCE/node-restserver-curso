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
    Producto.find({})
        .sort('categoria')
        .populate('usuario', 'usuario categoria')
        .exec((err,productoDB)=>{

            if (err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            res.json({
                ok:true,
                productoDB
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
    
    Producto.findById(id,{})
        .populate('usuario', 'usuario categoria')
        .exec((err,productoDB)=>{
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
    
    producto = new Producto({
        nombre:body.nombre,
        precioUni:body.precioUni,
        descripcion:body.descripcion,
        categoria: req.categoria._id,
        usuario: req.usuario._id
    });

    producto.save( (err,productoBD)=>{
        
        if (err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if (!productoBD){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        res.json({
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
app.put('/producto/:id', (req,res)=>{
    //grabar usuario
    //Grabar categoria del listado
    let id= req.params.id;
    let body = _.pick(req.body,['nombre precioUni descripción']); //Underscore, solo se permite hacer put sobre estos campos del objeto

    Producto.findByIdAndUpdate(id, body, {new: true, runValidators:true}, (err,productoDB) =>{
        
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});


//===========================
// BORRAR UN PRODUCTO 
//===========================
app.delete('/producto/:id', (req,res)=>{
    //Borrado logico disponible en false
    let id = req.params.id;
    let cambiaEstado = {
        estado:false
    }
    
    Producto.findByIdAndUpdate(id, cambiaEstado, {new:true}, (err,productoDB)=>{
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
        res.json({
            ok: true,
            producto: productoDB,
        });
    });
});

module.exports = app;