const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

// Ruta para crear una empresa
router.post('/', empresaController.crearEmpresa);

// Ruta para obtener una empresa por su ID
router.get('/empresa/:id', empresaController.obtenerEmpresa);
router.get('/', empresaController.verTodasEmpresas);

// Ruta para eliminar una empresa por su ID
router.delete('/empresa/:id', empresaController.eliminarEmpresa);

// Ruta para editar una empresa por su ID
router.put('/empresa/:id', empresaController.editarEmpresa);

module.exports = router;