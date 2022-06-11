const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var PublicacionesSchema = new Schema({
    pubCliente                  : {type: mongoose.Schema.ObjectId, required: true, default: "", index: true},
    pubVehiculo                 : {type: mongoose.Schema.ObjectId, required: true, default: "", index: true},
    pubPlantilla                : {type: mongoose.Schema.ObjectId, required: true, default: "", index: true},
    pubNombre                   : {type: String, default: "", index: true},
    pubTipoDocumento            : {type: String, default: "", required: true, index: true},
    pubContenido                : {type: String, default: ""},
    pubEstado                   : {type: String, default: "activo", index: true},
    pubFechaCreacion            : {type: Date, default: Date.now, index: true},
    pubFechaModificacion        : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

PublicacionesSchema.virtual('_plantilla_', {
    ref:'Plantillas',
    localField:'pubPlantilla',
    foreignField:'_id',
    justOne: true
});

PublicacionesSchema.virtual('_tipo_', {
    ref:'Tipos',
    localField:'pubTipoDocumento',
    foreignField:'tipCodigo',
    justOne: true
});

PublicacionesSchema.virtual('_tipo_', {
    ref:'Tipos',
    localField:'pubTipoDocumento',
    foreignField:'tipCodigo',
    justOne: true
});

PublicacionesSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'plaEstado',
    foreignField:'estCodigo',
    justOne: true
});

mongoose.model('Publicaciones', PublicacionesSchema);