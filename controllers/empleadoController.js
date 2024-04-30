const Empleado = require('../models/User');

exports.getEmpleadoFiltro = async (req, res) => {
    console.info('getEmpleadoFiltro')
    try {
        const filtros = req.body;
        console.info(filtros)
        let mapFiltros = {};
        if(filtros.nombre) {
            mapFiltros.nombre = { $regex: filtros.nombre }
        }
        if(filtros.apellido) {
            mapFiltros.apellido = { $regex: filtros.apellido }
        }
        if(filtros.rfc) {
            mapFiltros.rfc = { $regex: filtros.rfc }
        }
        if(filtros.email) {
            mapFiltros.email = filtros.email
        }
        const retorno = await Empleado.find(mapFiltros);
        console.info(retorno)
        res.send(retorno)
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }

}