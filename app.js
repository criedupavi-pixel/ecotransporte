require('newrelic');
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('./config/passport');
var jwt = require('jsonwebtoken');

var indexRouter = require('./routes/index');
var usuariosRouter = require('./routes/usuarios');
var tokenRouter = require('./routes/token');
var vehiculosRouter = require('./routes/vehiculos');
var vehiculosApiRouter = require('./routes/api/vehiculos');
var usuariosApiRouter = require('./routes/api/usuarios');
var authApiRouter = require('./routes/api/auth');

var app = express();

app.use(session({
  cookie: { maxAge: 240 * 60 * 60 * 1000 },
  secret: process.env.SESSION_SECRET || 'ecotransporte_secreto_dev',
  resave: true,
  saveUninitialized: true
}));

var mongoDB = process.env.NODE_ENV === 'production'
  ? process.env.MONGO_URI
  : (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecotransporte');

mongoose.connect(mongoDB)
  .then(function() {
    var destino = process.env.NODE_ENV === 'production' ? 'MongoDB Atlas (Produccion)' : 'MongoDB Local (' + mongoDB + ')';
    console.log('Conectado exitosamente a ' + destino);
  })
  .catch(function(err) {
    console.error('Error de conexion a MongoDB:', err);
  });

mongoose.Promise = global.Promise;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('secretKey', process.env.JWT_SECRET || 'jwt_secreto_ecotransporte_2026');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.env = process.env.NODE_ENV || 'development';
  next();
});

app.get('/login', function(req, res) {
  res.render('session/login', { info: {} });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, usuario, info) {
    if (err) return next(err);
    if (!usuario) return res.render('session/login', { info: info });
    req.logIn(usuario, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

app.get('/forgotPassword', function(req, res) {
  res.render('session/forgotPassword', { info: {} });
});

app.post('/forgotPassword', function(req, res) {
  var Usuario = require('./models/usuario');
  Usuario.findOne({ email: req.body.email }).then(function(usuario) {
    if (!usuario) {
      return res.render('session/forgotPassword', { info: { message: 'No existe un usuario con ese correo.' } });
    }
    usuario.resetPassword(function(err) {
      if (err) return res.render('session/forgotPassword', { info: { message: 'Error al enviar correo de recuperacion.' } });
      res.render('session/forgotPasswordMessage');
    });
  }).catch(function(err) {
    res.render('session/forgotPassword', { info: { message: err.message } });
  });
});

app.get('/resetPassword/:token', function(req, res) {
  var Token = require('./models/token');
  Token.findOne({ token: req.params.token }).then(function(token) {
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'No existe un usuario asociado al token. Verifique que su token no haya expirado.' });
    var Usuario = require('./models/usuario');
    Usuario.findById(token._userId).then(function(usuario) {
      if (!usuario) return res.status(400).send({ msg: 'No existe un usuario asociado al token.' });
      res.render('session/resetPassword', { errors: {}, usuario: usuario });
    });
  });
});

app.post('/resetPassword', function(req, res) {
  if (req.body.password !== req.body.confirm_password) {
    res.render('session/resetPassword', { errors: { confirm_password: { message: 'No coincide con el password ingresado' } }, usuario: { email: req.body.email } });
    return;
  }
  var Usuario = require('./models/usuario');
  Usuario.findOne({ email: req.body.email }).then(function(usuario) {
    usuario.password = req.body.password;
    usuario.save().then(function() {
      res.redirect('/login');
    }).catch(function(err) {
      res.render('session/resetPassword', { errors: err.errors, usuario: usuario });
    });
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

app.get('/privacy_policy', function(req, res) {
  res.send('<h1>Politica de Privacidad - EcoTransporte</h1><p>Uso exclusivo academico y demostracion OAuth.</p>');
});

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/token', tokenRouter);
app.use('/vehiculos', loggedIn, vehiculosRouter);

app.use('/api/auth', authApiRouter);
app.use('/api/usuarios', usuariosApiRouter);
app.use('/api/vehiculos', validarUsuario, vehiculosApiRouter);

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    console.log('Usuario sin loguearse, redirigiendo a /login');
    res.redirect('/login');
  }
}

function validarUsuario(req, res, next) {
  jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
    if (err) {
      res.status(401).json({ status: 'error', message: err.message, data: null });
    } else {
      req.body.userId = decoded.id;
      console.log('JWT verificado para usuario ID: ' + decoded.id);
      next();
    }
  });
}

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
