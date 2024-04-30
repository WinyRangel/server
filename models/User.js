const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido:{type: String, required: true},
  rfc:{type: String},
  email: { type: String, required: true, unique: true },
  nomEmpresa: {
    type: String,
    required: true
},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['usuario', 'administrador', 'empleadoAdmin'], default: 'usuario' },
  resetPassword: {
    token: { type: String },
    expires: { type: Date }
  },
  verificationToken: { type: String },
  validado: { type: Boolean, required: true, default: false},
});

const User = mongoose.model('User', userSchema);

module.exports = User;