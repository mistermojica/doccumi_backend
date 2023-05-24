const mongoose = require("mongoose");
const validator = require("validator");
let Schema = mongoose.Schema;

var ProfesionesSchema = new Schema (
  {
    proCodigo: { type: String, required: true, index: true },
    proNombre: {
      type: String,
      required: true,
      unique: [true, "Este nombre de profesión ya existe."],
      index: true
    },
    proCliente: { type: String, default: "", required: true, index: true },
    proEntidad: { type: mongoose.Schema.ObjectId, default: "", index: true },
    proOrden: { type: Number, default: 0, required: true, index: true },
    proEstado: { type: String, default: "activo", index: true },
    proFechaCreacion: { type: Date, default: Date.now, index: true },
    proFechaModificacion: { type: Date, default: Date.now, index: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, autoIndex: true }
);

ProfesionesSchema.virtual("_estado_", {
  ref: "Estados",
  localField: "proEstado",
  foreignField: "estCodigo",
  justOne: true,
});

mongoose.model("Profesiones", ProfesionesSchema);
