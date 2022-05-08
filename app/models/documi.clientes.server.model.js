const mongoose = require('mongoose');
const validator = require('validator');
let Schema = mongoose.Schema;

var ClientesSchema = new Schema({
    cliIdentificacion: {
        type: String,
        required: true,
        unique: [true, "Esta idenfificación ya existe!"],
        default: "",
        index: true
        // validate(value) {
        //     if (!validator.isEmail(value)){
        //         throw new Error("Este correo electrónico no es válido!")
        //     }
        // }
    },
    cliNombreCompleto      : {type: String, default: "", required: true},
    cliTelefono            : {type: String, default: "", required: true},
    cliCorreoElectronico   : {type: String, default: "", required: true},
    cliDireccion           : {type: String, default: "", required: true},
    cliCiudad              : {type: String, default: "", required: true},
    cliSector              : {type: String, default: "", required: true},
    cliPais                : {type: String, default: "", required: true},
    cliNacionalidad        : {type: String, default: "", required: true},
    cliFotoCedula          : {type: String, default: "", required: true},
    cliEstado              : {type: String, default: "activo", index: true},
    cliFechaCreacion       : {type: Date, default: Date.now, index: true},
    cliFechaModificacion   : {type: Date, default: Date.now, index: true}
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}, autoIndex: true});

ClientesSchema.virtual('_estado_', {
    ref:'Estados',
    localField:'cliEstado',
    foreignField:'estCodigo',
    justOne: true
});

// ClientesSchema.virtual('_isActive').get(function () {
//     let result = null;
//     if (typeof this.cliEstado !== "undefined" && this.cliEstado !== null){
//         result = (this.cliEstado === 'activo');
//     }
//     return result;
// });

mongoose.model('Clientes', ClientesSchema);