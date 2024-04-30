const Recurso = require("../models/Recurso.js");
const { transporter } = require('../nodemailer.js'); // Ajusta la ruta según tu estructura de carpetas
const Usuario = require("../models/User.js"); // Ajusta la ruta según tu estructura de carpetas
//const Empleado = require("../models/Empleado.js");
const Solicitud = require("../models/Solicitud.js"); // Ajusta la ruta según tu estructura de carpetas
const Tipo = require("../models/Tipo.js");


exports.crearRecurso = async (req, res) => {
    try {
        const { recurso, marca, gama, estatus, comentarios, nomEmpresa } = req.body; // Extrae los datos del cuerpo de la solicitud

        // Creamos nuestro recurso con los datos proporcionados
        const vrecurso = new Recurso({
            recurso,
            marca,
            gama,
            estatus,
            estado: "En almacén",
            comentarios: "Sin comentarios",
            nomEmpresa,
            posesion: "Empresa",
        });

        /*
        // Enviar correo electrónico a los empleados registrados
        const usuarios = await usuario.find(); // Ajusta el modelo y la consulta según tu estructura

        for (const usuario of usuarios) {
            const mailOptions = {
                from: 'danielamanzanorangel@gmail.com',
                to: usuario.email,
                subject: 'Nuevo Artículo Agregado',
                text: `Se ha agregado un nuevo artículo: ${vrecurso.recurso} marca: ${vrecurso.marca} gama: ${vrecurso.gama}`,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo enviado a ${usuario.email}`);
            } catch (error) {
                console.log(`Error al enviar correo a ${usuario.email}: ${error}`);
                // Puedes agregar aquí la lógica para intentar enviar el correo nuevamente o registrar el error
            }
        }
        */
        await vrecurso.save(); // Guarda el recurso en la base de datos
        res.status(201).json(vrecurso); // Envía una respuesta con el recurso creado y el código de estado 201 (creado)
    } catch (error) {
        console.error(error); // Registrar el error en la consola para fines de depuración
        res.status(500).json({ error: error.message }); // Enviar el error como respuesta
    }
};


exports.obtenerRecursos = async (req, res) => {

    try {
        const vrecurso = await Recurso.find();
        res.json(vrecurso)
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }

}

exports.obtenerRecurso = async (req, res) => {
    const recursoId = req.params.id; // Suponiendo que el ID esté en los parámetros de la solicitud

    try {
        const recurso = await Recurso.findById(recursoId);
        if (!recurso) {
            return res.status(404).json({ mensaje: 'Recurso no encontrado' });
        }
        res.json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al buscar el recurso');
    }
}


exports.actualizarRecurso = async (req, res) => {

    try {
        const { numSerie, recurso, marca, modelo, cantidad, estatus, gama, estado, nomEmpresa, comentarios, posesion,} = req.body;
        let vrecurso = await Recurso.findById(req.params.id);

        if(!vrecurso) {
            res.status(404).json({ msg: 'No existe' })
        }

        vrecurso.numSerie = numSerie;
        vrecurso.recurso = recurso;
        vrecurso.marca = marca;
        vrecurso.modelo = modelo;
        vrecurso.estatus = estatus;
        vrecurso.comentarios = comentarios;
        vrecurso.posesion = posesion;
        vrecurso.estado = estado
        
        vrecurso = await Recurso.findOneAndUpdate({ _id: req.params.id },vrecurso, { new: true} )
        res.json(vrecurso);

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}


exports.actualizarRecursoPosesion = async (req, res) => {

    try {
        const { recurso, marca, modelo, cantidad, estatus, gama, estado, nomEmpresa, comentarios, posesion} = req.body;
        let vrecurso = await Recurso.findById(req.params.id);

        if(!vrecurso) {
            res.status(404).json({ msg: 'No existe' })
        }

        vrecurso.recurso = recurso;
        vrecurso.marca = marca;
        vrecurso.gama = gama;
        vrecurso.modelo = modelo;
        vrecurso.estatus = estatus;
        vrecurso.comentarios = comentarios;
        vrecurso.posesion = posesion;

        vrecurso = await Recurso.findOneAndUpdate({ _id: req.params.id },vrecurso, { new: true} )
        res.json(vrecurso);

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}


exports.eliminarRecurso = async (req,res) => {

    try {
        let vrecurso = await Recurso.findById(req.params.id);

        if(!vrecurso){
            res.status(404).json({msg: 'Recurso inexistente'})
        }
        
        await Recurso.findOneAndRemove({ _id: req.params.id })
        res.json({msg: 'Recurso eliminado con exito'});

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

exports.solicitarRecurso = async (req, res) => {
    try {
        const { idUsuario, nombre, recurso, marca, comentariosolicitud, estado, numSerie, posesion, comentarios, nomEmpresa, } = req.body;

        
        // Crear una nueva solicitud con el estado "Pendiente"
        const nuevaSolicitud = new Solicitud({
            idUsuario,
            numSerie,
            nombre,
            recurso,
            marca,
            comentariosolicitud,
            estado: "Pendiente",
            posesion,
            comentarios,
            nomEmpresa,

        });

        // Guardar la solicitud en la base de datos
        await nuevaSolicitud.save();

        // Si la solicitud se crea correctamente, actualiza el estado del recurso a "Solicitado" en la tabla de recursos
        await Recurso.findOneAndUpdate({ numSerie, estatus: "No solicitado" }, { estatus: "Solicitado" });

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
// Obtener todas las solicitudes de un usuario
exports.obtenerSolicitudesPorUsuario = async (req, res) => {
    const { username } = req.params;
  
    try {
      // Find all requests for the user's idUsuario
      const solicitudes = await Solicitud.find({ username });
  
      res.status(200).json(solicitudes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  };
  

  exports.aprobarSolicitud = async (req, res) => {
    try {
        const solicitudId = req.params.id;
        const solicitud = await Solicitud.findById(solicitudId);

        if (!solicitud) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        // Obtener el empleado asociado a la solicitud
        const usuario = await Usuario.findOne({ idUsuario: solicitud.idUsuario });

        if (!usuario) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        // Enviar correo electrónico al empleado que solicitó el recurso
        const mailOptions = {
            from: 'actunity24@gmail.com',
            to: usuario.email,
            subject: 'Solicitud de recurso',
            text: `Hemos revisado tu solicitud, en la que solicitaste un ${solicitud.recurso}. 
            Tu recurso será entregado el día ${solicitud.fechaEntrega}.`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Correo enviado a ${usuario.email}`);
        } catch (error) {
            console.log(`Error al enviar correo a ${usuario.email}: ${error}`);
            // Puedes agregar aquí la lógica para intentar enviar el correo nuevamente o registrar el error
        }

        // Obtén la fecha de entrega del cuerpo de la solicitud
        const fechaEntrega = req.body.fechaEntrega;

        // Asigna la fecha de entrega y el estado a la solicitud
        solicitud.fechaEntrega = fechaEntrega;
        solicitud.estado = 'Aprobada';
        await solicitud.save();

        const vrecurso = await Recurso.findOne({ numSerie: solicitud.numSerie });
        if (!vrecurso) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }
        vrecurso.estado = 'Asignado';
        await vrecurso.save();

        return res.status(200).json({ message: 'Solicitud aceptada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};



  exports.rechazarSolicitud = async (req, res) => {
    try {
      const solicitudId = req.params.id; // 
      const { comentarioRechazo } = req.body;

      const solicitud = await Solicitud.findById(solicitudId); 
  
      if (!solicitud) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
        solicitud.estado = 'Rechazada';

        // Actualizar el campo 'comentarioRechazo' de la solicitud
        solicitud.comentarioRechazo = comentarioRechazo;

      await solicitud.save();
  
      return res.status(200).json({ message: 'Solicitud rechazada exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  //Registrar nuevo tipoRecurso
  exports.crearTipo = async (req, res) =>
  {
      try {
          let tipo;
  
          //creamos supervisor
          tipo = new Tipo(req.body);
          await  tipo.save();
          res.send(tipo);
      } catch(error){
          console.log(error);
          res.status(500).send('Error')
      }
  }
  
  
  exports.obtenerTipo = async (req, res) => {
      try{
          const tipo = await Tipo.find({}, 'nombre');
          res.json(tipo)
      }catch(error){
          console.log(error);
          res.status(500).send('Error')
      }
  }

  exports.editarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { comentarioRechazo } = req.body;

        let solicitud = await Solicitud.findById(id);

        if (!solicitud) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        // Actualizar el campo 'comentarioRechazo' de la solicitud
        solicitud.comentarioRechazo = comentarioRechazo;

        // Guardar los cambios
        solicitud = await solicitud.save();

        res.status(200).json(solicitud);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.actualizarRecursoNumSerie = async (req, res) => {
    try {
        const { numSerie } = req.params; // Cambio aquí

        const { recurso, marca, modelo, cantidad, estatus } = req.body;

        // Utilizar findOneAndUpdate para buscar y actualizar el recurso por su número de serie
        const vrecurso = await Recurso.findOneAndUpdate(
            { numSerie: numSerie },
            { $set: { recurso, marca, modelo, cantidad, estatus } },
            { new: true }
        );

        if (!vrecurso) {
            return res.status(404).json({ msg: 'El recurso no fue encontrado' });
        }

        res.json(vrecurso);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

exports.actualizarPosesionRecurso = async (req, res) => {
    try {
        const { numSerie } = req.params; // Cambio aquí
        const { posesion } = req.body; // Nueva propiedad a actualizar

        // Utilizar findOneAndUpdate para buscar y actualizar la posesión del recurso por su número de serie
        const vrecurso = await Recurso.findOneAndUpdate(
            { numSerie: numSerie },
            { $set: { posesion } },
            { new: true }
        );

        if (!vrecurso) {
            return res.status(404).json({ msg: 'El recurso no fue encontrado' });
        }

        res.json(vrecurso);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}


  /*Asignar recursos 
  
exports.getRecursoFiltro = async (req, res) => {
    console.info('getRecursoFiltro')
    try {
        const filtros = req.body;
        console.info(filtros)
        let mapFiltros = {};
        if(filtros.numSerie) {
            mapFiltros.numSerie = { $regex: filtros.numSerie }
        }
        if(filtros.recurso) {
            mapFiltros.recurso = { $regex: filtros.recurso }
        }
        if(filtros.marca) {
            mapFiltros.marca = { $regex: filtros.marca }
        }
        if(filtros.modelo) {
            mapFiltros.modelo = { $regex: filtros.modelo }
        }
        mapFiltros.estatus = "Sin Problemas";
        const retorno = await Recurso.find(mapFiltros);
        console.info(retorno)
        res.send(retorno)
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }

}

exports.asignarRecurso = async (req, res) => {
    console.info('asignarRecurso')
    try{
        const requestBody = req.body;
        console.info(requestBody)
        requestBody.recursos.forEach(async f => {
            const recurso = await Recurso.findOne({ _id: {$eq: f._id}});
            recurso.asignadoA = requestBody.empleado._id;
            console.info(recurso);
            await Recurso.findOneAndUpdate({ _id: recurso._id}, recurso, {new: true});
        })
        res.send({mensaje: 'Actualizado correctamente'});
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }
}

exports.getRecursoPorEmpleado = async (req, res) => {
    console.info('getRecursoPorEmpleado')
    try {
        const retorno = await Recurso.find({estatus: "Sin Problemas"});
        console.info(retorno)
        res.send(retorno)
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }

}

exports.asignarEmpleado = async (req, res) => {
    console.info('asignarEmpleado');
    try {
        const requestBody = req.body;
        console.info(requestBody);

        const promises = requestBody.map(async f => {
            const recurso = await Recurso.findOne({ _id: { $eq: f._id }});
            recurso.asignadoA = f.asignadoA;
            console.info(recurso);
            await Recurso.findOneAndUpdate({ _id: recurso._id }, recurso, { new: false });

            // Enviar correo electrónico al empleado asignado
            const empleado = await Empleado.findOne({ _id: { $eq: f.asignadoA }});
            const mailOptions = {
                from: 'tu_correo@gmail.com',
                to: empleado.email,
                subject: 'Recurso Asignado',
                text: `Se te ha asignado el recurso: ${recurso.nombre}`,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo enviado a ${empleado.email}`);
            } catch (error) {
                console.log(`Error al enviar correo a ${empleado.email}: ${error}`);
            }
        });

        // Esperar a que se completen todas las operaciones antes de enviar la respuesta
        await Promise.all(promises);

        res.send({ mensaje: 'Actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ mensaje: 'Hubo un error' });
    }
};

exports.reportarFallas = async (req, res) => {
    console.info('reportarFallas')
    try{
        const requestBody = req.body;
        console.info(requestBody)
        let vrecurso = await Recurso.findOne({ numSerie: {$eq: requestBody.numSerie}});

        if(!vrecurso) {
            res.status(404).json({ msg: 'No existe' })
        }

        vrecurso.asignadoA = null;
        vrecurso.descripcionFalla = requestBody.descripcion;
        vrecurso.fchDesdeFalla = requestBody.fchDesde;
        vrecurso.estatus = "Con Problemas";
        
        vrecurso = await Recurso.findOneAndUpdate({ _id: vrecurso._id },vrecurso, { new: true} )
        res.send({mensaje: 'Actualizado correctamente'});
    } catch(error) {
        console.error(error);
        res.status(500).send({mensaje: 'Hubo un error'})
    }
}

*/