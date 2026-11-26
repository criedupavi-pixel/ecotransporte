const Usuario = require('../../models/usuario');

exports.usuarios_list = async function(req, res) {
  const usuarios = await Usuario.find({});
  res.status(200).json({ usuarios: usuarios });
};

exports.usuarios_create = async function(req, res) {
  try {
    const usuario = new Usuario({
      nombre: req.body.nombre,
      email: req.body.email,
      password: req.body.password
    });
    await usuario.save();
    usuario.enviar_email_bienvenida();
    res.status(200).json(usuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.usuario_reservar = async function(req, res) {
  const Reserva = require('../../models/reserva');
  const usuario = await Usuario.findById(req.body.id);
  const reserva = new Reserva({
    usuario: usuario._id,
    vehiculo: req.body.vehiculo_id,
    desde: req.body.desde,
    hasta: req.body.hasta
  });
  await reserva.save();
  res.status(200).send();
};
