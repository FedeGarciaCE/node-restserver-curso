const jwt = require("jsonwebtoken");

//===============
//verificar token
//===============

//next continua con la ejecucion del programa
let verificaToken = (req,res,next) =>{
    let token = req.get('token');

    jwt.verify(token,process.env.SEED_TOKEN, (err,decoded)=>{
        if(err){
            return res.status(401).json({
                ok:false,
                err:{
                    message:'Token inválido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });

}


//====================
//verificar AdminRole
//====================

let verificarAdmin_Role = (req,res,next) =>{
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE'){
        next();    
    }else{
        return res.json({
            ok:false,
            err:{
                message:'El usuario no es administrador'
            }
        })
    }

    
}

module.exports = {
    verificaToken,
    verificarAdmin_Role
};