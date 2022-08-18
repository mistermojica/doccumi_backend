const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var TiposSchema = new Schema({
    tipDueno                    : {type: mongoose.Schema.ObjectId, default: null, index: true},
    tipCodigo                   : {type: String, default: "", required: true, index: true, unique: true},
    tipNombre                   : {type: String, default: "", required: true, index: true},
    tipModelo                   : {type: String, default: "", required: true, index: true},
    tipOrden                    : {type: Number, default: 0, required: true, index: true},
    tipEstado                   : {type: String, default: "activo", index: true},
    tipFechaCreacion            : {type: Date, default: Date.now, index: true},
    tipFechaModificacion        : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

TiposSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'plaEstado',
    foreignField:'estCodigo',
    justOne: true
});

mongoose.model('Tipos', TiposSchema);