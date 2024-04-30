const Recurso = require("../models/Recurso.js");
const { transporter } = require('../nodemailer.js'); // Ajusta la ruta según tu estructura de carpetas
const Solicitud = require("../models/Solicitud.js"); // Ajusta la ruta según tu estructura de carpetas
exports.solicitarRecurso = async (req, res) => {
  try {
      const { idUsuario,idRecurso, posesion, comentariosolicitud, comentarioRechazo, nomEmpresa,  nombre, recurso, marca, estado } = req.body;

      // Crear una nueva solicitud con el estado "En revisión"
      const nuevaSolicitud = new Solicitud({
          idRecurso, 
          posesion, 
          comentariosolicitud, 
          comentarioRechazo, 
          nomEmpresa,
          numSerie,
          idUsuario,
          nombre,
          recurso,
          marca,
          estado: "En revisión"
      });

      // Guardar la solicitud en la base de datos
      await nuevaSolicitud.save();

      res.status(200).json({ message: 'Solicitud enviada correctamente' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las solicitudes
exports.obtenerSolicitudes = async (req, res) => {
  try {
  
  const solicitudes = await Solicitud.find();
  res.status(200).json(solicitudes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Obtener una solicitud por su ID
exports.obtenerSolicitudPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }
    res.status(200).json(solicitud);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};



exports.aprobarSolicitud = async (req, res) => {
  try {
    const solicitudId = req.params.id; // 
    const solicitud = await Solicitud.findById(solicitudId); 

    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
      solicitud.estado = 'Aceptada';
    await solicitud.save();

    return res.status(200).json({ message: 'Solicitud aceptada exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.editarSolicitud = async (req, res) => {
  const { id } = req.params;
  const {
    idUsuario,
    idRecurso,
    posesion,
    comentariosolicitud,
    comentarioRechazo,
    nomEmpresa,
    nombre,
    recurso,
    marca,
    estado,
    numSerie,
    fechaSolicitud,
    fechaEntrega
  } = req.body;

  try {
    // Buscar la solicitud por su ID
    let solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    // Actualizar los campos de la solicitud
    solicitud.idUsuario = idUsuario;
    solicitud.idRecurso = idRecurso;
    solicitud.posesion = posesion;
    solicitud.comentariosolicitud = comentariosolicitud;
    solicitud.comentarioRechazo = comentarioRechazo;
    solicitud.nomEmpresa = nomEmpresa;
    solicitud.nombre = nombre;
    solicitud.recurso = recurso;
    solicitud.marca = marca;
    solicitud.estado = estado;
    solicitud.numSerie = numSerie;
    solicitud.fechaSolicitud = fechaSolicitud;
    solicitud.fechaEntrega = fechaEntrega;

    // Guardar la solicitud actualizada en la base de datos
    await solicitud.save();

    res.status(200).json({ message: 'Solicitud actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};