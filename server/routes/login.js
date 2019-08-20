const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req,res)=>{

    let body = req.body;

    Usuario.findOne({email: body.email}, (err,usuarioDB)=>{
        
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message:'Usuario o contraseña incorrectos'
                }
            });
        }
            /** Compara pwd encriptadas */
        if(!bcrypt.compareSync( body.password, usuarioDB.password )){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'Usuario o contraseña incorrectos'
                    }
                });
        }
        
        //PAYLOAD de JWT
        let token = jwt.sign({ 
            usuario: usuarioDB,
          }, process.env.SEED_TOKEN, {expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
            ok:true,
            usuario:usuarioDB,
            token
    
        });
    });
});




//CONFIGURACIONES DE GOOGLE

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    return {
        nombre:payload.name,
        email:payload.email,
        img:payload.picture,
        google:true
    }
    
}

app.post('/google', async (req,res)=>{
    
    let token = req.body.idtoken; //Recibo token de google

    let googleUser = await verify(token) //Verifico token de google
                            .catch(err =>{
                                return res.status(403).json({
                                    ok:false,
                                    err:err
                                });
                            });
    
    
    Usuario.findOne({email:googleUser.email},(err,usuarioDB)=>{ //Verifico si existe un usuario con ese correo
        if (err){
            return res.status(500).json({
                ok:false,
                err
            });
        };


        if( usuarioDB ){
            if(usuarioDB.google === false){ //Si existe un usuario no autentificado por google
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'Debe de usar su autentificacion normal'
                    }
                });
            }else{//Si se autentifica por google,
                let token = jwt.sign({ // Renuevo el token
                    usuario: usuarioDB,
                }, process.env.SEED_TOKEN, {expiresIn: process.env.CADUCIDAD_TOKEN});
                return res.json({
                    ok:true,
                    usuario:usuarioDB,
                    token
                });
            }
        }else{// Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err,usuarioDB) =>{ //Guardar en mongo
                if (err){
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }else{
                    let token = jwt.sign({ //genero nuevo token
                        usuario: usuarioDB,
                    }, process.env.SEED_TOKEN, {expiresIn: process.env.CADUCIDAD_TOKEN});
                    
                    return res.json({
                        ok:true,
                        usuario:usuarioDB,
                        token
                    });
                }
            });
        }
    });
});

module.exports = app;