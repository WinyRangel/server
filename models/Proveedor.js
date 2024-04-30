const mongoose = require('mongoose');

const ProveedorSchema = mongoose.Schema({
    idEmpresa: {
        type: String,
    },
    nombre: {
        type: String,
    },
    direccion: {
        type: String,
    },
    email: {
        type: String,
    },
    telefono: {
        type: Number,
        required: false
    },
    categoria: {
        type: String,
        required: false
    },
    productos: {
        type: String,
        required: false
    },
    nomEmpresa: {
        type: String,
    }
});

module.exports = mongoose.model('Proveedor', ProveedorSchema);
