const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require ('path');
app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id=req.params.id;
    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err:{
                    message: "No se ha seleccionado ningun archivo"
                }
            })
    }

    // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.'); 
 
    //Extensiones permitidas
    let extensionesValidas = ['png','jpg','jpeg','gif'];
    let extension = nombreCortado[1];

    if(extensionesValidas.indexOf(extension)<0){
        return res.status(400).json({
            ok:false,
            err:{
                message:`Las extensiones permitidas son ${extensionesValidas}`,
                ext: extension 
            }
        })
    }


    //Extensiones tipo
    tipoImagen(tipo,res);


    //CAMBIAR NOMBRE AL ARCHIVO
    let nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension  }`

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err)=>{
        if (err){
            return res.status(500).json({
                ok:true,
                err
            });
        }

        //Imagen cargada 
        if(tipo === 'usuario'){
            imagenUsuario(id,res, nombreArchivo);
        }
        if(tipo === 'producto'){
            imagenProducto(id,res, nombreArchivo);
        }
    });

});

//Manejo de img de Usuario
function imagenUsuario (id, res, nombreArchivo){

    Usuario.findById(id, (err,usuarioDB)=>{

        if (err){
            borraArchivo (nombreArchivo,'usuarios',res);
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!usuarioDB){
            borraArchivo (nombreArchivo,'usuarios',res);
            return res.status(400).json({
                ok:false,
                err:{
                    message:"usuario no existe"
                }
            });
        }

        borraArchivo (usuarioDB.img,'usuario',res);

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err,usuarioGuardado)=>{
            res.json({
                ok:true,
                usuario: usuarioGuardado,
            });
        });
    });

}

//Manejo de Img de producto
function imagenProducto(id, res, nombreArchivo){
    
    Producto.findById(id, (err,productoDB)=>{
        
        if (err){
            borraArchivo(nombreArchivo,'producto',res);
            return res.status(500).json({
                ok:false,
                err
            });
        }
    
        if(!productoDB){
            borraArchivo (nombreArchivo,'producto',res);
            return res.status(400).json({
                ok:false,
                err:{
                    message:"usuario no existe"
                }
            });
        }


        borraArchivo (productoDB.img,'producto',res);

        productoDB.img = nombreArchivo;

        productoDB.save((err,productoGuardado)=>{
            res.json({
                ok:true,
                producto: productoGuardado,
            });
        });


    })

}

//BorrarArchivo
function borraArchivo (nombreImagen, tipo, res){
    tipoImagen(tipo,res);
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)
        if(fs.existsSync(pathImagen)){
            fs.unlinkSync(pathImagen);
        }
}

//Extensiones tipo
function tipoImagen (tipo,res){
    let tiposValidos = ['producto','usuario'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok:false,
            err:{
                message:`Los tipos validos son ${tiposValidos}` 
            }
        });
    }
}
module.exports = app;