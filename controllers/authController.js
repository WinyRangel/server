const User = require('../models/User');
const Empresa = require('../models/Empresa');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { transporter } = require('../nodemailer'); // Ajusta la ruta según tu estructura de carpetas
const { body, validationResult } = require('express-validator');

exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, rfc, email, password, username, nomEmpresa } = req.body;
    
    // Verificar si ya existe un usuario con el correo electrónico proporcionado
    const usuarioExistenteEmail = await User.findOne({ email });
    if (usuarioExistenteEmail) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }
    
    // Verificar si ya existe un usuario con el nombre de usuario proporcionado
    const usuarioExistenteUsername = await User.findOne({ username });
    if (usuarioExistenteUsername) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está registrado' });
    }

    // Generar un hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear un nuevo usuario con los datos proporcionados
    const usuario = await User.create({ 
      nombre, 
      apellido, 
      rfc, 
      email, 
      username,
      nomEmpresa,
      password: hashedPassword, 
      rol: 'usuario',
      validado: false
    });

    // Buscar la empresa correspondiente utilizando el nombre de la empresa proporcionado
    const empresa = await Empresa.findOne({ nomEmpresa });

    // Verificar si se encontró la empresa
    if (!empresa) {
      return res.status(404).json({ mensaje: 'La empresa seleccionada no existe' });
    }

    // Agregar el ID del usuario al array de usuarios en el documento de la empresa
    empresa.users.push(usuario._id);

    // Guardar los cambios en la empresa
    await empresa.save();

    // Enviar una respuesta con el usuario creado
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', usuario });
  } catch (error) {
    console.error(error);
    // Enviar una respuesta de error en caso de cualquier problema
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

exports.usuarios = async (req, res) => {
  try {
    // Realizar una consulta a la base de datos para obtener todos los usuarios
    const usuarios = await User.find();

    // Verificar si se encontraron usuarios
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron usuarios registrados' });
    }

    // Si se encontraron usuarios, enviar una respuesta con la lista de usuarios
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error(error);
    // Enviar una respuesta de error en caso de cualquier problema
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};


exports.usuariosPorEmpresa = async (req, res) => {
  try {
    // Obtener el nombre de la empresa del usuario autenticado
    const nomEmpresaUsuario = req.usuario.nomEmpresa;

    // Buscar todos los usuarios que pertenecen a la misma empresa del usuario autenticado
    const usuarios = await User.find({ nomEmpresa: nomEmpresaUsuario });

    // Verificar si se encontraron usuarios
    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron usuarios para esta empresa' });
    }

    // Enviar los usuarios encontrados como respuesta
    res.status(200).json({ usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};


exports.obtenerUser = async (req, res) => {
  console.info('obtener Registro')

  try {
    // Verificar el rol del usuario antes de permitir la operación
    if (req.user && req.user.rol === 'administrador') {
      const users = await User.find();
      res.json(users);
    } else {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Hubo un error');
  }
}

exports.inicioSesion = async (req, res) => {
  try {
    const { password, username } = req.body;

    // Obtener usuario por nombre de usuario
    const usuario = await User.findOne({ username });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    //
     // Verificar si el usuario está validado
     if (!usuario.validado) {
      return res.status(401).json({ mensaje: 'El usuario no está validado ' });
    }


    // Obtener información de la empresa del usuario
    const empresa = await Empresa.findOne({ nomEmpresa: usuario.nomEmpresa });

    const token = jwt.sign({ usuarioId: usuario._id, nombre: usuario.nombre,nomEmpresa: usuario.nomEmpresa, rol: usuario.rol, username: usuario.username  }, 'secreto', { expiresIn: '120ms' });
    // Generar un token aleatorio
    const verificationToken = jwt.sign({ usuarioId: usuario._id }, 'secreto', { expiresIn: '1h' });

    // Guardar el token en la base de datos para el usuario
    usuario.verificationToken = verificationToken;
    await usuario.save();

    // Enviar el token por correo electrónico
    await enviarCorreoDeVerificacion(usuario.email, verificationToken);

    // Enviar una respuesta con el token de verificación
    res.status(200).json({ mensaje: 'Se ha enviado un correo electrónico con el token de verificación', empresa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

//Cambios
const nodemailer = require('nodemailer');

exports.verificarTokenCorreo = async (req, res) => {
  try {
    const { token } = req.body;

    // Verificar el token recibido
    const decodedToken = jwt.verify(token, 'secreto');


    // Buscar al usuario por su ID y el token de verificación
    const usuario = await User.findOne({ _id: decodedToken.usuarioId, verificationToken: token });

    // Si el usuario no existe o el token de verificación no coincide, enviar un error
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Token de verificación inválido' });
    }

    // Si el token es válido y coincide, eliminar el token de verificación y autenticar al usuario
    usuario.verificationToken = undefined;
    await usuario.save();

    // Aquí puedes iniciar sesión correctamente para el usuario si lo deseas
    // También puedes redirigirlo a la página deseada después de la verificación

    //aqui
     //Generar un token JWT
     const tokenR = jwt.sign({ usuarioId: usuario._id, nombre: usuario.nombre, rol: usuario.rol, nomEmpresa: usuario.nomEmpresa }, 'secreto', { expiresIn: '120ms' });
    // Aquí puedes asignar un token de sesión al usuario y devolverlo en la respuesta
    const tokenSesion = jwt.sign({ usuarioId: usuario._id, nombre: usuario.nombre, rol: usuario.rol, nomEmpresa: usuario.nomEmpresa, }, 'secreto', { expiresIn: '1h' });


    //res.status(200).json({ mensaje: 'Token de verificación válido' });
  // Devolver el token de sesión en la respuesta
  res.status(200).json({ mensaje: 'Token de verificación válido', tokenSesion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

async function enviarCorreoDeVerificacion(email, verificationToken) {
  const mailOptions = {
    from: 'actunity24@gmail.com',
    to: email,
    subject: 'Verificación de correo electrónico',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación de correo electrónico</title>
      <!-- Agrega el enlace al archivo CSS personalizado -->
      <link rel="stylesheet" href="styles.css">
      <!-- Agrega el enlace al archivo CSS de Bootstrap -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      <style>
      /* Estilos personalizados para la tarjeta */
.custom-card {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 10px;
}

/* Estilos personalizados para el título de la tarjeta */
.custom-title {
  color: #007bff;
}

/* Estilos personalizados para el texto de la tarjeta */
.custom-text {
  color: #6c757d;
}

/* Estilos personalizados para el token de verificación */
.custom-token {
  font-size: 18px;
  color: #28a745;
  font-weight: bold;
}

      </style>
    </head>
    <body>
    
    <div class="container">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <div class="card custom-card">
            <div class="card-body">
              <h4 class="card-title custom-title">Verificación de correo electrónico</h4>
              <p class="card-text custom-text">Por favor, ingresa el siguiente token para verificar tu identidad:</p>
              <p class="card-text custom-token"><b>${verificationToken}</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </body>
    </html>
    
    `
  };

  await transporter.sendMail(mailOptions);
}


exports.verificarToken = async (req, res) => {
  try {
    const { token } = req.body;

    // Buscar al usuario por su token de verificación
    const usuario = await User.findOne({ verificationToken: token });

    // Si el usuario no existe o el token no coincide, enviar un error
    if (!usuario || usuario.verificationToken !== token) {
      return res.status(401).json({ mensaje: 'Token de verificación inválido' });
    }

    // Si el token coincide, eliminar el token de verificación y autenticar al usuario
    usuario.verificationToken = undefined;
    await usuario.save();

    res.status(200).json({ mensaje: 'Token de verificación válido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

function resetPasswordEmail(usuario, resetToken) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 0 20px;
      }
      .header {
        background-color: #007bff;
        color: #fff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
        background-color: #ffffff;
      }
      .footer {
        padding: 20px;
        text-align: center;
        background-color: #007bff;
        color: #fff;
  
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .img-container {
          text-align: center;
        }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Restablecer Contraseña</h2>
      </div>
      <div class="content">
        <p>Hola ${usuario.nombre},</p>
        <p>Has solicitado restablecer tu contraseña. Para restablecerla, haz clic en el siguiente botón:</p>
        <button type="button" class="btn btn-outline-light"><p><a href="http://localhost:4200/reset-password/${resetToken}">Restablecer Contraseña</a></p></button>
        <p>Este enlace expirará en una hora.</p>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
        <div class="img-container">
          <img src="https://www.edenred.es/wp-content/uploads/2022/03/ImagenBlog_1.jpg" width="250">
        </div>
      </div>
      
      <div class="footer">
        <h3>Gracias, tu equipo de ACTUNITY</h3>
      </div>
    </div>
  </body>
  </html>
  
  `;
}



exports.recuperarContrasena = async (req, res) => {
  try {
    const emailRules = [
      body('email').isEmail().withMessage('Por favor ingrese un correo electrónico válido'),
    ];

    const validationResults = validationResult(req);
    if (!validationResults.isEmpty()) {
      return res.status(400).json({ errors: validationResults.array() });
    }

    const { email } = req.body;
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const resetToken = jwt.sign({ usuarioId: usuario._id }, 'secreto', { expiresIn: '1h' });
    usuario.resetPassword = { resetToken, expires: Date.now() + 3600000 }; // 1 hora de expiración
    await usuario.save();

    // Envía el correo electrónico con el enlace de restablecimiento de contraseña
    const mailOptions = {
      from: 'actunity24@gmail.com',
      to: usuario.email,
      subject: 'Restablecer contraseña',
      html: resetPasswordEmail(usuario, resetToken)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ mensaje: 'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// Controlador para cambiar la contraseña
exports.cambiarContrasena = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    // Verificar si se proporcionó una nueva contraseña y un token válido
    if (!newPassword || !token) {
      return res.status(400).json({ mensaje: 'Se requiere una nueva contraseña y un token válido' });
    }

    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, 'secreto');

    // Verificar si el token está expirado
    if (decodedToken.expires < Date.now()) {
      return res.status(400).json({ mensaje: 'El token de restablecimiento de contraseña ha expirado' });
    }

    // Buscar al usuario por su ID
    const usuario = await User.findById(decodedToken.usuarioId);

    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cambiar la contraseña del usuario
    usuario.password = hashedPassword;
    usuario.resetPassword = undefined; // Eliminar el token de reseteo de la contraseña
    await usuario.save();

    res.status(200).json({ mensaje: 'Contraseña restablecida exitosamente' });

  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ mensaje: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ mensaje: 'El token de restablecimiento de contraseña ha expirado' });
    }
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

//USUARIOS

exports.obtenerUsuarios = async (req, res) =>{
  console.info('obtenerUsuarios')
  try{
      const usuarios = await Usuario.find();
      res.json(usuarios);
  }catch(error){
      console.log(error);
      res.status(500).send('Hubo un error');
  }
}

exports.actualizarUsuario = async (req, res) => {
    console.info('actualizarUsuario');
    try {
        console.info('id: ' + req.params.id);
        const { nombre, apellido, rfc, email, nomEmpresa, username, password, rol, resetPassword, verificationToken, } = req.body;
        let usuario = await User.findById(req.params.id);
        console.info(usuario);
        if (!usuario) {
            res.status(404).json({ msg: 'No existe este usuario' });
            return; // Añadido para evitar que el código siga ejecutándose
        }
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.rfc = rfc;
        usuario.email = email;
        usuario.nomEmpresa = nomEmpresa;
        usuario.username = username;
        usuario.password = password;
        usuario.rol = rol;
        usuario.resetPassword = resetPassword;
        usuario.verificationToken = verificationToken;


        usuario = await User.findOneAndUpdate({ _id: req.params.id }, usuario, { new: true });
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
};

exports.actualizarUsuarioValidado = async (req, res) => {
  console.info('actualizarUsuario');
  try {
    console.info('id: ' + req.params.id);
    const { validado } = req.body;
    let usuario = await User.findByIdAndUpdate(req.params.id, { validado }, { new: true });
    console.info(usuario);
    if (!usuario) {
      res.status(404).json({ msg: 'No existe este usuario' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).send('Hubo un error');
  }
};



exports.obtenerUsuario = async (req, res) => {
    console.info('obtenerUsuario');
    console.info(req.params);
    try {
        let usuario = await User.findById(req.params.id);
        if (!usuario) {
            res.status(404).json({ msg: 'No existe este usuario' });
            return; // Añadido para evitar que el código siga ejecutándose
        }
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
};

exports.eliminarUsuario = async (req, res) => {
    console.info('eliminarUsuario');
    try {
        let usuario = await User.findById(req.params.id);

        if (!usuario) {
            res.status(404).json({ msg: 'No existe el usuario' });
            return; // Añadido para evitar que el código siga ejecutándose
        }

        await User.findOneAndDelete({ _id: req.params.id });
        res.json({ msg: 'Usuario eliminado con éxito' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
};

exports.editProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get the user ID from the JWT payload
    const { nombre, apellido, rfc, email, password, username } = req.body;

    // Check if the user updated their email or username, and if so, check if they are already taken
    const existingUserByEmail = await User.findOne({ email, _id: { $ne: userId } });
    const existingUserByUsername = await User.findOne({ username, _id: { $ne: userId } });

    if (existingUserByEmail || (email && existingUserByEmail?.email === email)) {
      return res.status(400).json({ message: 'The email is already in use.' });
    }

    if (existingUserByUsername || (username && existingUserByUsername?.username === username)) {
      return res.status(400).json({ message: 'The username is already in use.' });
    }

    // If the user updated their password, hash it
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Update the user's information in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        nombre,
        apellido,
        rfc,
        email,
        username,
        password: hashedPassword,
      },
      { new: true }
    );

    res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

/*authController.js
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Buscar al usuario por el token de reset
    const usuario = await User.findOne({ 'resetPassword.token': token, 'resetPassword.expires': { $gt: Date.now() } });

    if (!usuario) {
      return res.status(400).json({ message: 'El token de restablecimiento de contraseña no es válido o ha caducado.' });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña y limpiar el token de reset
    usuario.password = hashedPassword;
    usuario.resetPassword = undefined; // Aquí actualizamos el campo resetPassword
    await usuario.save();

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    next(error);
  }
};


exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Genera y guarda el token de restablecimiento de contraseña
    const token = await bcrypt.hash(user.email, 10);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validez del token
    await user.save();

    // Envía el correo electrónico con el enlace de restablecimiento de contraseña
    await transporter.sendMail({
      to: user.email,
      subject: 'Solicitud de restablecimiento de contraseña',
      html: `<p>Haz clic en <a href="http://localhost:4200/reset-password/${token}">este enlace</a> para restablecer tu contraseña.</p>`
    });

    res.status(200).json({ message: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.' });
  } catch (error) {
    console.error('Error al procesar la solicitud de restablecimiento de contraseña:', error);
    res.status(500).json({ error: 'Se produjo un error al procesar la solicitud.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Verifica que el token no haya caducado
    });

    if (!user) {
      return res.status(400).json({ error: 'El token es inválido o ha caducado' });
    }

    // Actualiza la contraseña del usuario
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'La contraseña se ha restablecido correctamente.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ error: 'Se produjo un error al restablecer la contraseña.' });
  }
};

*/