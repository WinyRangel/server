const Empresa = require('../models/Empresa');

exports.crearEmpresa = async (req, res) => {
    try {
        const nuevaEmpresa = new Empresa(req.body);
        const empresaGuardada = await nuevaEmpresa.save();
        res.status(201).json({ mensaje: 'Empresa creada exitosamente', empresa: empresaGuardada });
    } catch (error) {
        console.error('Error al crear empresa:', error);
        res.status(500).json({ mensaje: 'Hubo un error al crear la empresa' });
    }
}

exports.obtenerEmpresa = async (req, res) => {
    try {
        const idEmpresa = req.params.id;
        const empresa = await Empresa.findById(idEmpresa);
        if (!empresa) {
            return res.status(404).json({ mensaje: 'Empresa no encontrada' });
        }
        res.status(200).json(empresa);
    } catch (error) {
        console.error('Error al obtener empresa:', error);
        res.status(500).json({ mensaje: 'Hubo un error al obtener la empresa' });
    }
}

exports.eliminarEmpresa = async (req, res) => {
    try {
        const idEmpresa = req.params.id;
        const empresaEliminada = await Empresa.findByIdAndDelete(idEmpresa);
        if (!empresaEliminada) {
            return res.status(404).json({ mensaje: 'Empresa no encontrada' });
        }
        res.status(200).json({ mensaje: 'Empresa eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar empresa:', error);
        res.status(500).json({ mensaje: 'Hubo un error al eliminar la empresa' });
    }
}

exports.editarEmpresa = async (req, res) => {
    try {
        const idEmpresa = req.params.id;
        const empresaActualizada = await Empresa.findByIdAndUpdate(idEmpresa, req.body, { new: true });
        if (!empresaActualizada) {
            return res.status(404).json({ mensaje: 'Empresa no encontrada' });
        }
        res.status(200).json({ mensaje: 'Empresa actualizada exitosamente', empresa: empresaActualizada });
    } catch (error) {
        console.error('Error al editar empresa:', error);
        res.status(500).json({ mensaje: 'Hubo un error al editar la empresa' });
    }
}


exports.verTodasEmpresas = async (req, res) => {
    try {
        const empresas = await Empresa.find();
        res.status(200).json(empresas);
    } catch (error) {
        console.error('Error al obtener todas las empresas:', error);
        res.status(500).json({ mensaje: 'Hubo un error al obtener todas las empresas' });
    }
}
