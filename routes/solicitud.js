// routes/solicitudRoutes.js

const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitarRecurso');

router.post('/', solicitudController.solicitarRecurso);
// Ruta para editar una solicitud por su ID
router.put('/:id', solicitudController.editarSolicitud);

module.exports = router;
