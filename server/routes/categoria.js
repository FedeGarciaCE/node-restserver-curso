const express = require('express');
const {verificaToken, verificarAdmin_Role} = require('../middlewares/autenticacion');
const _ = require('underscore');

let app = express();
let Categoria = require ('../models/categoria');


//=======================
// MOSTRAR LAS CATEGORIAS
//=======================
app.get('/categoria', verificaToken, (req,res)=>{
    
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre mail')
        .exec((err,categoriasDB)=>{
        if (err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok:true,
            categoriasDB
        })
    });
});


//=============================
// MOSTRAR UNA CATEGORIA POR ID
//=============================
app.get('/categoria/:id', verificaToken, (req,res)=>{
    let id = req.params.id;
    
    Categoria.findById(id, (err,categoriaDB)=>{
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(500).json({
                ok:false,
                err:{
                    message:"El id no es correcto"
                }
            });
        }
        res.json({
            ok:true,
            categoria: categoriaDB
        });
    })
});


//=======================
// CREAR NUEVA CATEGORIA
//=======================
app.post('/categoria', verificaToken, (req,res)=>{
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) =>{
        
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(500).json({
                ok:false,
                err
            });
        }
    
        res.json({
            ok:true,
            categoria: categoriaDB,
        });
        
    });
        

});


//=========================
// ACTUALIZAR UNA CATEGORIA
//=========================
app.put('/categoria/:id', verificaToken, (req,res)=>{
    let id= req.params.id;
    let body = _.pick(req.body,['descripcion']); //Underscore, solo se permite hacer put sobre estos campos del objeto

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators:true},(err, categoriaDB)=>{
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        res.json({
            ok:true,
            categoria: categoriaDB
        })
    });

});


//=========================
// BORRAR UNA CATEGORIA
//=========================
app.delete('/categoria/:id', [verificaToken,verificarAdmin_Role], (req,res)=>{
 //Solo un administrador puede borrar categorias
 //eliminar fisicamente
 let id= req.params.id;

 Categoria.findByIdAndRemove(id, (err,categorriaBorrada) =>{

    if (err){
        return res.status(500).json({
            ok:false,
            err
        });
    }

    if(!categorriaBorrada){
        return res.status(500).json({
            ok:false,
            err:{
                message: 'El id no existe'
            }
        });
    }

    res.json({
        ok:true,
        message:"categoria borrada", 
        usuario:categorriaBorrada
    });

})

});

module.exports = app;