var express = require('express');
var router = express.Router();
var Vehiculo = require('../models/vehiculo');

router.get('/', async function(req, res, next) {
  const vehiculos = await Vehiculo.find({});
  res.render('index', { title: 'EcoTransporte - Produccion', vehiculos: vehiculos });
});

module.exports = router;
