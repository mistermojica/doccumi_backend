const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var CamposadicionalesSchema = new Schema({
    // caaNoRegistroPlaca: {
    //     type: String,
    //     required: true,
    //     unique: [true, "Esta placa ya existe!"],
    //     default: "", 
    //     index: true
    // },
    caaDueno                : {type: mongoose.Schema.ObjectId, default: null, index: true},
    caaChasis               : {type: String, default: "", required: true, unique: [true, "Esta chasis ya existe!"]},
    caaDueno                : {type: mongoose.Schema.ObjectId, default: null, index: true},
    caaStatusVehiculo       : {type: String, default: "", index: true, required: true},
    caaTipoEmision          : {type: String, default: "", index: true, required: true},
    caaTipoVehiculo         : {type: String, default: "", index: true, required: true},
    caaAnoFabricacion       : {type: String, default: "", index: true, required: true},
    caaMarca                : {type: String, default: "", index: true, required: true},
    caaModelo               : {type: String, default: "", index: true, required: true},
    caaColor                : {type: String, default: "", index: true, required: true},
    caaPrecio               : {type: Number, default: "", index: true, required: true},
    caaCosto                : {type: Number, default: "", index: true, required: true},
    caaFotoMatricula        : {type: Array, default: [], required: false},
    caaFotos                : {type: Array, default: [], required: false},
    caaEstado               : {type: String, default: "activo", index: true},
    caaFechaCreacion        : {type: Date, default: Date.now, index: true},
    caaFechaModificacion    : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

CamposadicionalesSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'caaEstado',
    foreignField:'estCodigo',
    justOne: true
});

mongoose.model('Camposadicionales', CamposadicionalesSchema);