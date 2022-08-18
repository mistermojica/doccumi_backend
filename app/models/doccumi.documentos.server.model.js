const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var DocumentosSchema = new Schema({
    docCliente                  : {type: mongoose.Schema.ObjectId, required: true, default: null, index: true},
    docVehiculo                 : {type: mongoose.Schema.ObjectId, required: true, default: null, index: true},
    docPlantilla                : {type: mongoose.Schema.ObjectId, required: true, default: null, index: true},
    docTipoId                   : {type: mongoose.Schema.ObjectId, required: true, default: null, index: true},
    docTipoDocumento            : {type: String, default: "", required: true, index: true},
    docNombre                   : {type: String, default: "", index: true},
    docContenido                : {type: String, default: ""},
    docEstado                   : {type: String, default: "activo", index: true},
    docFechaCreacion            : {type: Date, default: Date.now, index: true},
    docFechaModificacion        : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

DocumentosSchema.virtual('_plantilla_', {
    ref:'Plantillas',
    localField:'docPlantilla',
    foreignField:'_id',
    justOne: true
});

DocumentosSchema.virtual('_tipo_', {
    ref:'Tipos',
    localField:'docTipoDocumento',
    foreignField:'tipCodigo',
    justOne: true
});

DocumentosSchema.virtual('_tipo_', {
    ref:'Tipos',
    localField:'docTipoDocumento',
    foreignField:'tipCodigo',
    justOne: true
});

DocumentosSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'plaEstado',
    foreignField:'estCodigo',
    justOne: true
});

mongoose.model('Documentos', DocumentosSchema);