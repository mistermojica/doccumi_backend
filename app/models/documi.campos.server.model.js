const mongoose = require("mongoose");
const validator = require("validator");
let Schema = mongoose.Schema;

var CamposSchema = new Schema (
  {
    camCodigo: { type: String, required: true, index: true },
    camNombre: {
      type: String,
      required: true,
      unique: [true, "Este nombre de campo ya existe."],
      index: true
    },
    camModelo: { type: String, default: "", required: true, index: true },
    camCampo: { type: String, default: "", required: true, index: true },
    camDueno: { type: mongoose.Schema.ObjectId, default: "", index: true },
    camOrden: { type: Number, default: 0, required: true, index: true },
    camTipo: { type: String, default: "privado", index: true },
    camEstado: { type: String, default: "activo", index: true },
    camFechaCreacion: { type: Date, default: Date.now, index: true },
    camFechaModificacion: { type: Date, default: Date.now, index: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, autoIndex: true }
);

CamposSchema.virtual("_estado_", {
  ref: "Estados",
  localField: "camEstado",
  foreignField: "estCodigo",
  justOne: true,
});

mongoose.model("Campos", CamposSchema);
