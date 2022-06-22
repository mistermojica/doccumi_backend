const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var VehiculosSchema = new Schema({
    vehNoRegistroPlaca: {
        type: String,
        required: true,
        unique: [true, "Esta placa ya existe!"],
        default: "", 
        index: true
    },
    vehChasis               : {type: String, default: "", required: true, unique: [true, "Esta chasis ya existe!"],},
    vehStatusVehiculo       : {type: String, default: "", index: true, required: true},
    vehTipoEmision          : {type: String, default: "", index: true, required: true},
    vehTipoVehiculo         : {type: String, default: "", index: true, required: true},
    vehAnoFabricacion       : {type: String, default: "", index: true, required: true},
    vehMarca                : {type: String, default: "", index: true, required: true},
    vehModelo               : {type: String, default: "", index: true, required: true},
    vehColor                : {type: String, default: "", index: true, required: true},
    vehPrecio               : {type: Number, default: "", index: true, required: true},
    vehCosto                : {type: Number, default: "", index: true, required: true},
    vehFotoMatricula        : {type: Array, default: [], required: true},
    vehEstado               : {type: String, default: "venta", index: true},
    vehFechaCreacion        : {type: Date, default: Date.now, index: true},
    vehFechaModificacion    : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

VehiculosSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'vehEstado',
    foreignField:'estCodigo',
    justOne: true
});

mongoose.model('Vehiculos', VehiculosSchema);