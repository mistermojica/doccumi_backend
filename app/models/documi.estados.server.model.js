const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var EstadosSchema = new Schema({
    estCodigo                   : {type: String, default: "", required: true, index: true, unique: true},
    estNombre                   : {type: String, default: "", required: true, index: true},
    estFechaCreacion            : {type: Date, default: Date.now, index: true},
    estFechaModificacion        : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

mongoose.model('Estados', EstadosSchema);