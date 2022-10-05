const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var SoportesSchema = new Schema({
    sopDueno                    : {type: mongoose.Schema.ObjectId, default: null, index: true},
    sopCorreo                   : {type: String, default: "", required: true, index: true},
    sopAsunto                   : {type: String, default: "", required: true, index: true},
    sopTipo                     : {type: String, default: "", required: true, index: true},
    sopDescripcion              : {type: String, default: "", required: true},
    sopEstado                   : {type: String, default: "activo", index: true},
    sopFechaCreacion            : {type: Date, default: Date.now, index: true},
    sopFechaModificacion        : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

SoportesSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'plaEstado',
    foreignField:'estCodigo',
    justOne: true
});

mongoose.model('Soportes', SoportesSchema);