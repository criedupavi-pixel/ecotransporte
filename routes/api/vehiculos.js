var express = require('express');
var router = express.Router();
var vehiculoControllerAPI = require('../../controllers/api/vehiculoControllerAPI');

router.get('/', vehiculoControllerAPI.vehiculo_list);
router.post('/create', vehiculoControllerAPI.vehiculo_create);
router.delete('/delete', vehiculoControllerAPI.vehiculo_delete);

module.exports = router;
