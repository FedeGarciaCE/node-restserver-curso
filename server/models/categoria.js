const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion:{
        type: String,
        unique: true,
        require:[true, 'La descripción necesaria']
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref:'usuario'
    }
});

module.exports = mongoose.model('categoria', categoriaSchema);