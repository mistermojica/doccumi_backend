var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConfiguracionesSchema = new Schema({
    conDueno                : {type: mongoose.Schema.ObjectId, unique: true, index: true},
    conIGUsuario            : {type: String, default: ""},
    conIGContrasena         : {type: String, default: ""},
    conFBUsuario            : {type: String, default: ""},
    conFBContrasena         : {type: String, default: ""},
    conSCUsuario            : {type: String, default: ""},
    conSCContrasena         : {type: String, default: ""},
    conEstado               : {type: String, default: "activo", index: true},
    conFechaCreacion        : {type: Date, default: Date.now, index: true},
    conFechaModificacion    : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

ConfiguracionesSchema.virtual('_estado_', {
    ref:'Estados',          //ModeloRelacionado
    localField:'estado',    //ModeloLocal.campo
    foreignField:'codigo',  //ModeloRelacionado.campo
    justOne: true
});

mongoose.model('Configuraciones', ConfiguracionesSchema);