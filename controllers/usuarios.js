const Usuario = require('../models/usuario');

module.exports = {
  list: async function(req, res, next) {
    try {
      const usuarios = await Usuario.find({});
      res.render('usuarios/index', { usuarios: usuarios });
    } catch (err) {
      next(err);
    }
  },
  create_get: function(req, res, next) {
    res.render('usuarios/create', { errors: {}, usuario: new Usuario() });
  },
  create: async function(req, res, next) {
    if (req.body.password !== req.body.confirm_password) {
      res.render('usuarios/create', {
        errors: { confirm_password: { message: 'No coincide con el password ingresado' } },
        usuario: new Usuario({ nombre: req.body.nombre, email: req.body.email })
      });
      return;
    }

    try {
      const nuevoUsuario = await Usuario.create({
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password
      });
      nuevoUsuario.enviar_email_bienvenida();
      res.redirect('/usuarios');
    } catch (err) {
      console.error(err);
      res.render('usuarios/create', {
        errors: err.errors || { general: { message: err.message } },
        usuario: new Usuario({ nombre: req.body.nombre, email: req.body.email })
      });
    }
  },
  update_get: async function(req, res, next) {
    const usuario = await Usuario.findById(req.params.id);
    res.render('usuarios/update', { errors: {}, usuario: usuario });
  },
  update: async function(req, res, next) {
    const update_values = { nombre: req.body.nombre };
    try {
      await Usuario.findByIdAndUpdate(req.params.id, update_values);
      res.redirect('/usuarios');
    } catch (err) {
      res.render('usuarios/update', {
        errors: err.errors,
        usuario: new Usuario({ nombre: req.body.nombre, email: req.body.email })
      });
    }
  },
  delete: async function(req, res, next) {
    try {
      await Usuario.findByIdAndDelete(req.body.id);
      res.redirect('/usuarios');
    } catch (err) {
      next(err);
    }
  }
};
