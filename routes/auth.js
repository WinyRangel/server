const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registro', authController.registro);
router.get('/:id', authController.obtenerUsuario); // Ruta para obtener un usuario por su ID
router.put('/:id', authController.actualizarUsuario); // Ruta para actualizar un usuario por su ID

router.put('/editar', authController.editProfile); // Ruta para actualizar un usuario por su ID

router.delete('/:id', authController.eliminarUsuario); // Ruta para eliminar un usuario por su ID
router.get('/', authController.usuarios);
router.get('/userEmpresa', authController.usuariosPorEmpresa);
router.post('/inicio-sesion', authController.inicioSesion);
router.post('/recuperar-contrasena', authController.recuperarContrasena);
router.post('/cambiar-contrasena', authController.cambiarContrasena);
router.post('/verificar-token', authController.verificarToken);
router.post('/verificar-token-correo', authController.verificarTokenCorreo);
router.put('/validar/:id', authController.actualizarUsuarioValidado);

//router.post('/reset-password/:token', authController.resetPassword);
// Ruta para solicitar un restablecimiento de contraseña
//router.post('/forgot-password', authController.requestPasswordReset);

// Ruta para restablecer la contraseña utilizando el token
//router.post('/reset-password/:token', authController.resetPassword);
module.exports = router;
