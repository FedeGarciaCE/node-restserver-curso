const mongoose = require('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');

let Schema = mongoose.Schema;
let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({
    nombre:{
        type: String,
        require: [true, 'El nombre es necesario'],
    },
    email:{
        type: String,
        unique: true,
        require:[true, 'El correo es necesario']
    },
    password:{
        type: String,
        require: [true,"El password es obligatoria"]
    },
    img:{
        type: String,
        require: false
    },
    role:{
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado:{
        type: Boolean,
        default: true
    },
    google:{
        type: Boolean,
        default: false
    }
});

usuarioSchema.plugin(uniqueValidator,{message: '{PATH} debe ser unico'})
usuarioSchema.methods.toJSON = function (){  //Elimino 
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};
module.exports = mongoose.model('usuario', usuarioSchema);