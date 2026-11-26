const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const Usuario = require('../models/usuario');

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async function(email, password, done) {
    try {
      const usuario = await Usuario.findOne({ email: email });
      if (!usuario) {
        return done(null, false, { message: 'Email no existente o incorrecto.' });
      }
      if (!usuario.validPassword(password)) {
        return done(null, false, { message: 'Password incorrecto.' });
      }
      if (!usuario.verificado) {
        return done(null, false, { message: 'Cuenta no verificada. Revisa tu correo electronico.' });
      }
      return done(null, usuario);
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret',
    callbackURL: (process.env.HOST || 'http://localhost:3000') + '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('Perfil recibido desde Google OAuth:', profile.id);
    Usuario.findOneOrCreateByGoogle(profile, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'dummy_facebook_app_id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy_facebook_app_secret',
    fbGraphVersion: 'v18.0'
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('Token de Facebook validado correctamente para perfil:', profile.id);
    Usuario.findOneOrCreateByFacebook(profile, function(err, user) {
      if (err) {
        console.error('Error en findOneOrCreateByFacebook:', err);
      }
      return done(err, user);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function(id, cb) {
  try {
    const usuario = await Usuario.findById(id);
    cb(null, usuario);
  } catch (err) {
    cb(err);
  }
});

module.exports = passport;
