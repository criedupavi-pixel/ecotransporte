const Vehiculo = require('../../models/vehiculo');

exports.vehiculo_list = async function(req, res) {
  const vehiculos = await Vehiculo.find({});
  res.status(200).json({ vehiculos: vehiculos });
};

exports.vehiculo_create = async function(req, res) {
  const vehiculo = new Vehiculo({
    code: req.body.code,
    color: req.body.color,
    modelo: req.body.modelo,
    ubicacion: [req.body.lat, req.body.lng]
  });
  await Vehiculo.add(vehiculo);
  res.status(200).json({ vehiculo: vehiculo });
};

exports.vehiculo_delete = async function(req, res) {
  await Vehiculo.removeByCode(req.body.code);
  res.status(204).send();
};
