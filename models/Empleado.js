const mongoose = require('mongoose');

const EmpleadoEsquema = mongoose.Schema({
    idEmpresa: {
        type: String,
        required: true
    },
    idEmpleado: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    aPaterno: {
        type: String,
        required: true
    },
    aMaterno: {
        type: String,
        required: false
    },
    rfc: {
        type: String,
        required:false
    },    
    telefono: {
        type: String,
        required:false
    },
    email: {
        type: String,
        required:false
    },
    departamento: {
        type: String,
        required:false
    },    
    gerente: {
        type: String,
        required:false
    },    
    puesto: {
        type: String,
        required:false
    },
    tipoEmpleado:{
        type: String,
        enum: ['empleadoAdmin', 'empleado'], default: 'empleado'}
    }    
);

module.exports = mongoose.model('Empleado', EmpleadoEsquema);
