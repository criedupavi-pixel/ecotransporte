const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservaSchema = new Schema({
  desde: Date,
  hasta: Date,
  vehiculo: { type: Schema.Types.ObjectId, ref: 'Vehiculo' },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

reservaSchema.methods.diasDeReserva = function() {
  return Math.ceil((this.hasta - this.desde) / (1000 * 60 * 60 * 24)) + 1;
};

module.exports = mongoose.model('Reserva', reservaSchema);
