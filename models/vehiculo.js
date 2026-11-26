const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehiculoSchema = new Schema({
  code: { type: Number, required: true, unique: true },
  color: { type: String, required: true },
  modelo: { type: String, required: true },
  ubicacion: {
    type: [Number],
    index: { type: '2dsphere', sparse: true }
  }
});

vehiculoSchema.statics.createInstance = function(code, color, modelo, ubicacion) {
  return new this({
    code: code,
    color: color,
    modelo: modelo,
    ubicacion: ubicacion
  });
};

vehiculoSchema.methods.toString = function() {
  return 'code: ' + this.code + ' | color: ' + this.color;
};

vehiculoSchema.statics.allVehiculos = function(cb) {
  if (cb) return this.find({}).exec().then(res => cb(null, res)).catch(err => cb(err));
  return this.find({});
};

vehiculoSchema.statics.add = function(aVehiculo, cb) {
  if (cb) return this.create(aVehiculo).then(res => cb(null, res)).catch(err => cb(err));
  return this.create(aVehiculo);
};

vehiculoSchema.statics.findByCode = function(aCode, cb) {
  if (cb) return this.findOne({ code: aCode }).exec().then(res => cb(null, res)).catch(err => cb(err));
  return this.findOne({ code: aCode });
};

vehiculoSchema.statics.removeByCode = function(aCode, cb) {
  if (cb) return this.deleteOne({ code: aCode }).exec().then(res => cb(null, res)).catch(err => cb(err));
  return this.deleteOne({ code: aCode });
};

module.exports = mongoose.model('Vehiculo', vehiculoSchema);
