const mongoose = require('mongoose');

const EmpresaSchema = mongoose.Schema({
    idEmpresa: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        required: true,
        index: true,
        unique: true
    },
    nomEmpresa: {
        type: String,
        required: true,
        unique: true
    },
    direccion: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    telefono: {
        type: Number,
        required: false
    },
    recursos:{
        type: [String],
        required: false
    },
    proveedores:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedores'
        }],
        required: false
    },
    users:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        required: false
    },
    solicitudes:{
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Solicitudes'
        }],
        required: false
    }
});

module.exports = mongoose.model('Empresa', EmpresaSchema);
