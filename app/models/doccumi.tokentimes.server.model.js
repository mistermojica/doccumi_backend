var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TokenTimesSchema = new Schema({
    tokentime          : {type: String, index: true},
    token              : {type: String, index: true},
    usuario            : {type: String, index: true},
    tipo               : {type: String, index: true},
    estado             : {type: String, default: "activo", index: true},
    expira_tiempo      : {type: Number},
    expira_medida      : {type: String},
    fecha_creacion     : {type: Date, default: Date.now},
    fecha_modificacion : {type: Date, default: Date.now}
});

mongoose.model('Tokentimes', TokenTimesSchema);