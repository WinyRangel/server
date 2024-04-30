const mongoose = require('mongoose');

const SolicitudSchema = mongoose.Schema({
    idSolicitud:{
        type: Number,
    },
    idRecurso:{
        type: Number,
    },
    idUsuario: {
        type: Number,
        require: true
    },
    nombre: {
        type: String,
        require: true
    },
    recurso: {
        type: String,
    },
    posesion: {
        type: String,
    },
    comentariosolicitud:{
        type: String, 
        require: true
    },
    comentarioRechazo:{
        type: String, 
        require: true
    },
    numSerie: {
        type: String,
        require: true
    },
    nomEmpresa: {
        type: String,
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Aprobada', 'Rechazada'], default: 'Pendiente'},
    fechaSolicitud: {
        type: Date,
        default: Date.now()
    },
    fechaEntrega: {
        type: Date,
    }
});

module.exports = mongoose.model('Solicitud', SolicitudSchema);
