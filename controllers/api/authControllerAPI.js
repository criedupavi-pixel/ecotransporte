const Usuario = require('../../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  authenticate: async function(req, res, next) {
    try {
      const userInfo = await Usuario.findOne({ email: req.body.email });
      if (!userInfo) {
        return res.status(401).json({ status: 'error', message: 'Email/password invalidos!', data: null });
      }
      if (bcrypt.compareSync(req.body.password, userInfo.password)) {
        const token = jwt.sign({ id: userInfo._id }, req.app.get('secretKey'), { expiresIn: '7d' });
        res.status(200).json({
          message: 'Usuario encontrado!',
          data: { usuario: userInfo, token: token }
        });
      } else {
        res.status(401).json({ status: 'error', message: 'Email/password invalidos!', data: null });
      }
    } catch (err) {
      next(err);
    }
  },
  forgotPassword: async function(req, res, next) {
    try {
      const usuario = await Usuario.findOne({ email: req.body.email });
      if (!usuario) {
        return res.status(401).json({ message: 'No existe el usuario', data: null });
      }
      usuario.resetPassword(function(err) {
        if (err) return next(err);
        res.status(200).json({ message: 'Se envio un email para reestablecer el password', data: null });
      });
    } catch (err) {
      next(err);
    }
  },
  authFacebookToken: function(req, res, next) {
    if (req.user) {
      req.user.save().then(function() {
        const token = jwt.sign({ id: req.user.id }, req.app.get('secretKey'), { expiresIn: '7d' });
        res.status(200).json({
          message: 'Usuario encontrado o creado via Facebook Token!',
          data: { user: req.user, token: token }
        });
      }).catch(function(err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      });
    } else {
      res.status(401).json({ status: 'error', message: 'Token de Facebook invalido o ausente' });
    }
  }
};
