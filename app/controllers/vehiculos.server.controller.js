var mofac = require("../../config/ModelFactory");
var db = mofac("documi");
const publicaHelper = require("../helpers/publicaciones.server.helper");
var entityName = "Vehículo(s)";
let mapEstadoVehiculos = new Map();
let mapVariants = new Map();
let intFotosVehiculosLength = 0;
let arrFotosVehiculos = [];

mapEstadoVehiculos.set("venta", {
  tipo: "success",
  corta: "En Venta",
  larga: "Vehículos en Venta",
});
mapEstadoVehiculos.set("pendiente", {
  tipo: "info",
  corta: "Pendientes",
  larga: "Vehículos Pendientes",
});
mapEstadoVehiculos.set("vendido", {
  tipo: "warning",
  corta: "Vendidos",
  larga: "Vehículos Vendidos",
});
mapEstadoVehiculos.set("taller", {
  tipo: "danger",
  corta: "En Taller",
  larga: "Vehículos en Taller",
});
mapEstadoVehiculos.set("activo", {
  tipo: "info",
  corta: "Activo",
  larga: "Activos",
});

exports.list = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Vehiculos.find({})
    .where("estado")
    .ne("borrado")
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .list: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error en la lista de ${entityName}.`,
          data: {},
        });
      } else {
        console.log("data:", data);
        res.json({
          status: "SUCCESS",
          message: `Lista de ${entityName} generada exitosamente.`,
          data: data,
        });
      }
    });
};

exports.create = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log("req.body:", req.body);

  var entity = new db.Vehiculos(req.body);
  entity.save(function (err) {
    if (err) {
      console.log(__filename + " >> .create: " + JSON.stringify(err));
      res.json({
        status: "FAILED",
        message: `Error en la creación del ${entityName}.`,
        data: err,
      });
    } else {
      if (req.body.vehFotoMatricula.length > 0) {
        intFotosVehiculosLength = req.body.vehFotoMatricula.length;
        req.body.vehFotoMatricula.forEach(url => {
          publicaHelper.download({url: url.replace('https', 'http'), cb: addFilesToArray});
        });
      }
      res.json({
        status: "SUCCESS",
        message: `${entityName} creado exitosamente.`,
        data: entity,
      });
    }
  });
};

function addFilesToArray(file) {
  console.log('addFilesToArray() || file:', file);
  arrFotosVehiculos.push(file);
  if (intFotosVehiculosLength === arrFotosVehiculos.length) {

    let ctx = {
      "image": arrFotosVehiculos,
      "caption" : "Hyundai Grandeur 2012",
      "location" : "Santo Domingo, Dominican Republic",
      "year": "2012",
      "brand": "Hyundai",
      "model": "Grandeur",
      "show": true
    }

    publish(ctx);
  }
}

function publish(ctx) {
  console.log('publish() || ctx:', ctx);

  // if (req.body.to === 'instagram') {
    // publicaHelper.instagram(ctx).then((resIG) => {
    //   console.log("result resIG:", resIG);
    //   result = resIG;
    // }).catch((errIG) => {
    //   console.log("result errIG:", errIG);
    //   result = resIG;
    // });
  // }

  // if (req.body.to === 'marketplace') {
    publicaHelper.marketplace(ctx).then((resMP) => {
      console.log("result resMP:", resMP);
      result = resMP;
    }).catch((errMP) => {
      console.log("result errMP:", errMP);
      result = errMP;
    });
  // }
}

exports.update = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log("req.body:", req.body);

  db.Vehiculos.findOne({ _id: req.body._id })
    .where("estado")
    .ne("borrado")
    .exec(function (err, entitydb) {
      if (err) {
        console.log(__filename + " >> .update: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener ${entityName}.`,
          data: {},
        });
      } else {
        entitydb.vehNoRegistroPlaca = req.body.vehNoRegistroPlaca;
        entitydb.vehChasis = req.body.vehChasis;
        entitydb.vehStatusVehiculo = req.body.vehStatusVehiculo;
        entitydb.vehTipoEmision = req.body.vehTipoEmision;
        entitydb.vehTipoVehiculo = req.body.vehTipoVehiculo;
        entitydb.vehAnoFabricacion = req.body.vehAnoFabricacion;
        entitydb.vehMarca = req.body.vehMarca;
        entitydb.vehModelo = req.body.vehModelo;
        entitydb.vehColor = req.body.vehColor;
        entitydb.vehPrecio = req.body.vehPrecio;
        entitydb.vehCosto = req.body.vehCosto;
        entitydb.vehFotoMatricula = req.body.vehFotoMatricula;
        entitydb.vehEstado = req.body.vehEstado;
        entitydb.vehFechaModificacion = new Date();
        entitydb.save(function (err) {
          if (err) {
            console.log(__filename + " >> .update: " + JSON.stringify(err));
            res.json({
              status: "FAILED",
              message: `Error en la actualización de ${entityName}.`,
              data: {},
            });
          } else {
            res.json({
              status: "SUCCESS",
              message: `${entityName} se actualizó exitosamente.`,
              data: entitydb,
            });
          }
        });
      }
    });
};

exports.delete = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Vehiculos.deleteOne({ _id: req.params._id }, function (err) {
    if (err) {
      console.log(__filename + " >> .delete: " + JSON.stringify(err));
      res.json({
        status: "FAILED",
        message: `Error al eliminar ${entityName}.`,
        data: {},
      });
    } else {
      res.json({
        status: "SUCCESS",
        message: `${entityName} se eliminó exitosamente.`,
        data: {},
      });
    }
  });
};

exports.findById = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Vehiculos.findOne({ _id: req.params.id })
    .select("-__v")
    .where("estado")
    .ne("borrado")
    .populate({
      path: "_estado_",
      select: "codigo nombre -_id",
      match: { isActive: true },
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findById: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener el ${entityName}.`,
          data: {},
        });
      } else {
        res.json({
          status: "SUCCESS",
          message: `${entityName} encontrado exitosamente.`,
          data: data,
        });
      }
    });
};

exports.listpop = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Vehiculos.find({})
    .select("-__v")
    .where("estado")
    .ne("borrado")
    .sort({ orden: 1 })
    .lean()
    .populate({
      path: "_estado_",
      select: "codigo nombre",
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findById: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener la lista de ${entityName}.`,
          data: err,
        });
      } else {
        res.json({
          status: "SUCCESS",
          message: `Lista de ${entityName} generada exitosamente.`,
          data: data,
        });
      }
    });
};

exports.dashboard = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log("req.params", req.params);

  // db.Vehiculos.find({})
  db.Vehiculos
    .find({})
    .select("-__v")
    // .where('vehDueno').eq(req.params.dueno)
    .where("estado")
    .ne("borrado")
    .sort({ vehNoRegistroPlaca: 1 })
    .lean()
    .populate({
      path: "_estado_",
      select: "codigo nombre",
    })
    .exec(function (err, data) {
      console.log("err:", err);
      console.log("data:", data);
      if (err) {
        console.log(__filename + " >> .dashboard: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener la lista de ${entityName}.`,
          data: err,
        });
      } else {
        let mapGroup = new Map();
        data.forEach((vehiculo) => {
          let vehEstado = vehiculo.vehEstado;
          if (mapGroup.has(vehEstado)) {
            let grupo = mapGroup.get(vehEstado);
            grupo.cantidad = grupo.cantidad + 1;
            grupo.monto = grupo.monto + vehiculo.vehPrecio;
            mapGroup.set(vehEstado, grupo);
            // console.log("grupo A:", grupo);
          } else {
            console.log("vehEstado", vehEstado);
            let estveh = mapEstadoVehiculos.get(vehEstado);
            let grupo = {
              tipo: estveh.tipo,
              cantidad: 1,
              descripcion_larga: estveh.larga,
              descripcion_corta: estveh.corta,
              monto: vehiculo.vehPrecio,
            };
            // console.log("grupo B:", grupo);
            mapGroup.set(vehEstado, grupo);
          }
        });

        let graficos = {
          ventas: {
            labels: [],
            values: [],
          },
          inventario: {
            labels: [],
            values: [],
          },
        };

        let dsLabels = [];
        let dsValuesV = [];
        let dsValuesI = [];
        mapGroup.forEach((value, key) => {
          dsLabels.push(value.descripcion_corta);
          dsValuesV.push(value.monto);
          dsValuesI.push(value.cantidad);
        });

        // console.log("KLK:", dsLabels, dsValuesV, dsValuesI);

        graficos.ventas.labels = dsLabels;
        graficos.inventario.labels = dsLabels;
        graficos.ventas.values = dsValuesV;
        graficos.inventario.values = dsValuesI;

        let result = {
          carts: Array.from(mapGroup.values()),
          charts: graficos,
        };

        console.log("result:", result);
        console.log("graficos:", graficos);

        res.json({
          status: "SUCCESS",
          message: `Lista de ${entityName} generada exitosamente. E1`,
          data: result,
        });
      }
    });
};

exports.findByDueno = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Vehiculos.find({})
  // db.Vehiculos.find({ vehDueno: req.params.dueno })
    .select("-__v")
    .where("plaEstado")
    .ne("borrado")
    .sort({ orden: 1 })
    .lean()
    .populate({
      path: "_estado_",
      select: "codigo nombre",
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findById: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener la lista de ${entityName}.`,
          data: err,
        });
      } else {
        res.json({
          status: "SUCCESS",
          message: `Lista de ${entityName} generada exitosamente.`,
          data: data,
        });
      }
    });
};
