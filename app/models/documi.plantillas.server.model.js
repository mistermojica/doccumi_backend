const mongoose = require("mongoose");
const validator = require("validator");
let Schema = mongoose.Schema;

var PlantillasSchema = new Schema(
  {
    plaNombre: { type: String, default: "", required: true, index: true },
    plaTipoDocumento: {
      type: String,
      default: "",
      required: true,
      index: true,
    },
    plaDueno: { type: mongoose.Schema.ObjectId, default: "", index: true },
    plaContenido: { type: String, default: "", required: true },
    plaEstado: { type: String, default: "activo", index: true },
    plaFechaCreacion: { type: Date, default: Date.now, index: true },
    plaFechaModificacion: { type: Date, default: Date.now, index: true },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, autoIndex: true }
);

PlantillasSchema.virtual("_estado_", {
  ref: "Estados",
  localField: "plaEstado",
  foreignField: "estCodigo",
  justOne: true,
});

mongoose.model("Plantillas", PlantillasSchema);
