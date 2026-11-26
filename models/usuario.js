const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('./token');
const mailer = require('../mailer/mailer');

const saltRounds = 10;
const Schema = mongoose.Schema;

const validateEmail = function(email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    required: [true, 'El nombre es obligatorio']
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'El email es obligatorio'],
    lowercase: true,
    unique: true,
    validate: [validateEmail, 'Por favor, ingrese un email valido'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
  },
  password: {
    type: String,
    required: [true, 'El password es obligatorio']
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  verificado: {
    type: Boolean,
    default: false
  },
  googleId: String,
  facebookId: String
});

usuarioSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
  }
  next();
});

usuarioSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

usuarioSchema.methods.enviar_email_bienvenida = function(cb) {
  const token = new Token({
    _userId: this.id,
    token: crypto.randomBytes(16).toString('hex')
  });
  const email_destination = this.email;
  const host = process.env.HOST || 'http://localhost:3000';

  token.save().then(function() {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@ecotransporte.com',
      to: email_destination,
      subject: 'Verificacion de cuenta - EcoTransporte',
      text: 'Hola,\n\nPor favor, para verificar su cuenta haga click en el siguiente enlace:\n\n' +
        host + '/token/confirmation/' + token.token + '\n'
    };

    mailer.sendMailWithPreview(mailOptions)
      .then(function() {
        console.log('Email de bienvenida enviado a ' + email_destination);
        if (cb) cb(null);
      })
      .catch(function(err) {
        console.error('Error enviando email de bienvenida:', err);
        if (cb) cb(err);
      });
  }).catch(function(err) {
    console.error('Error guardando token:', err);
    if (cb) cb(err);
  });
};

usuarioSchema.methods.resetPassword = function(cb) {
  const token = new Token({
    _userId: this.id,
    token: crypto.randomBytes(16).toString('hex')
  });
  const email_destination = this.email;
  const host = process.env.HOST || 'http://localhost:3000';

  token.save().then(function() {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@ecotransporte.com',
      to: email_destination,
      subject: 'Reseteo de password de cuenta - EcoTransporte',
      text: 'Hola,\n\nPor favor, para resetear el password de su cuenta haga click en este enlace:\n\n' +
        host + '/resetPassword/' + token.token + '\n'
    };

    mailer.sendMailWithPreview(mailOptions)
      .then(function() {
        console.log('Se envio un email para resetear el password a: ' + email_destination);
        if (cb) cb(null);
      })
      .catch(function(err) {
        console.error('Error enviando email de reseteo:', err);
        if (cb) cb(err);
      });
  }).catch(function(err) {
    if (cb) cb(err);
  });
};

usuarioSchema.statics.findOneOrCreateByGoogle = async function(condition, callback) {
  const self = this;
  try {
    let result = await self.findOne({
      $or: [
        { googleId: condition.id },
        { email: condition.emails[0].value }
      ]
    });

    if (result) {
      if (!result.googleId) {
        result.googleId = condition.id;
        await result.save();
      }
      if (callback) return callback(null, result);
      return result;
    } else {
      const values = {
        googleId: condition.id,
        email: condition.emails[0].value,
        nombre: condition.displayName || 'Usuario Google',
        password: crypto.randomBytes(16).toString('hex'),
        verificado: true
      };
      const newUser = await self.create(values);
      if (callback) return callback(null, newUser);
      return newUser;
    }
  } catch (err) {
    if (callback) return callback(err, null);
    throw err;
  }
};

usuarioSchema.statics.findOneOrCreateByFacebook = async function(condition, callback) {
  const self = this;
  try {
    const email = (condition.emails && condition.emails[0] && condition.emails[0].value)
      ? condition.emails[0].value
      : condition.id + '@facebook.com';

    let result = await self.findOne({
      $or: [
        { facebookId: condition.id },
        { email: email }
      ]
    });

    if (result) {
      if (!result.facebookId) {
        result.facebookId = condition.id;
        await result.save();
      }
      if (callback) return callback(null, result);
      return result;
    } else {
      const values = {
        facebookId: condition.id,
        email: email,
        nombre: condition.displayName || 'Usuario Facebook',
        password: crypto.randomBytes(16).toString('hex'),
        verificado: true
      };
      const newUser = await self.create(values);
      if (callback) return callback(null, newUser);
      return newUser;
    }
  } catch (err) {
    if (callback) return callback(err, null);
    throw err;
  }
};

module.exports = mongoose.model('Usuario', usuarioSchema);
