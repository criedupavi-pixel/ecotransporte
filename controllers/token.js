const Usuario = require('../models/usuario');
const Token = require('../models/token');

module.exports = {
  confirmationGet: async function(req, res, next) {
    try {
      const token = await Token.findOne({ token: req.params.token });
      if (!token) {
        return res.status(400).send({
          type: 'not-verified',
          msg: 'No encontramos un usuario con este token. Quiza haya expirado y debas solicitar uno nuevo.'
        });
      }
      const usuario = await Usuario.findById(token._userId);
      if (!usuario) {
        return res.status(400).send({ msg: 'No encontramos un usuario con este token.' });
      }
      if (usuario.verificado) {
        return res.redirect('/login');
      }
      usuario.verificado = true;
      await usuario.save();
      res.redirect('/login');
    } catch (err) {
      return res.status(500).send({ msg: err.message });
    }
  }
};
