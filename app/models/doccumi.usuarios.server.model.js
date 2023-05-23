let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UsuarioSchema = new Schema({
    usuario                 : {type: String, index: true},
    contrasena              : {type: String, index: true},
    nombre                  : {type: String, index: true},
    usuario_stripe          : {type: String, index: true},
    telefono                : {type: String},
    whatsapp                : {type: String},
    email                   : {type: String},
    foto                    : {type: String},
    logo                    : {type: String},
    tipo                    : {type: String, index: true},
    nombre_empresa          : {type: String},
    tipo_empresa            : {type: String},
    estado                  : {type: String, default: "activo", index: true},
    puede_admin_ofertas     : {type: Boolean, default: false, index: true},
    puede_admin_empleados   : {type: Boolean, default: false, index: true},
    puede_admin_sucursales  : {type: Boolean, default: false, index: true},
    fecha_creacion          : {type: Date, default: Date.now},
    fecha_modificacion      : {type: Date, default: Date.now}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

// UsuarioSchema.virtual('_tipousuario_', {
//     ref:'Tiposusuarios',    //ModeloRelacionado
//     foreignField:'codigo',  //ModeloRelacionado.campo
//     localField:'tipo',      //ModeloLocal.campo
//     justOne: true
// });

// UsuarioSchema.virtual('_proveedores_', {
//     ref:'Proveedores',       //ModeloRelacionado
//     foreignField:'usuarios', //ModeloRelacionado.campo
//     localField:'_id',        //ModeloLocal.campo
//     justOne: false
// });

UsuarioSchema.virtual('_estado_', {
    ref:'Estados',          //ModeloRelacionado
    localField:'estado',    //ModeloLocal.campo
    foreignField:'codigo',  //ModeloRelacionado.campo
    justOne: true
});

// UsuarioSchema.virtual('_isActive').get(function () {
//     let result = null;
//     if (typeof this.estado !== "undefined" && this.estado !== null){
//         result = (this.estado === 'activo');
//     }
//     return result;
// });

mongoose.model('Usuarios', UsuarioSchema);