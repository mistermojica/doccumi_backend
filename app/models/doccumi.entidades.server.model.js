const mongoose = require('mongoose');
let Schema = mongoose.Schema;

var EntidadesSchema = new Schema({
    entDueno                : {type: mongoose.Schema.ObjectId, default: null, index: true},
    entTipo                 : {type: String, default: "", index: true, required: true},
    entFotos                : {type: Array, default: [], required: false},
    entAtributos            : {type: Map, of: Schema.Types.Mixed, index: true},
    entEstado               : {type: String, default: "pendiente", index: true},
    entFechaCreacion        : {type: Date, default: Date.now, index: true},
    entFechaModificacion    : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

EntidadesSchema.virtual('_estado_', {
    ref: 'Estados',
    localField: 'entEstado',
    foreignField: 'estCodigo',
    justOne: true
});

mongoose.model('Entidades', EntidadesSchema);