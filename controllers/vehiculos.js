const Vehiculo = require('../models/vehiculo');

exports.vehiculo_list = async function(req, res) {
  const vehiculos = await Vehiculo.find({});
  res.render('vehiculos/index', { vehiculos: vehiculos });
};

exports.vehiculo_create_get = function(req, res) {
  res.render('vehiculos/create');
};

exports.vehiculo_create_post = async function(req, res) {
  const vehiculo = new Vehiculo({
    code: req.body.code,
    color: req.body.color,
    modelo: req.body.modelo,
    ubicacion: [parseFloat(req.body.lat), parseFloat(req.body.lng)]
  });
  await Vehiculo.add(vehiculo);
  res.redirect('/vehiculos');
};

exports.vehiculo_update_get = async function(req, res) {
  const vehiculo = await Vehiculo.findById(req.params.id);
  res.render('vehiculos/update', { vehiculo: vehiculo });
};

exports.vehiculo_update_post = async function(req, res) {
  const vehiculo = await Vehiculo.findById(req.params.id);
  vehiculo.code = req.body.code;
  vehiculo.color = req.body.color;
  vehiculo.modelo = req.body.modelo;
  vehiculo.ubicacion = [parseFloat(req.body.lat), parseFloat(req.body.lng)];
  await vehiculo.save();
  res.redirect('/vehiculos');
};

exports.vehiculo_delete_post = async function(req, res) {
  await Vehiculo.findByIdAndDelete(req.body.id);
  res.redirect('/vehiculos');
};
