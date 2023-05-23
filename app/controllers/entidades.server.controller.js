var mofac = require("../../config/ModelFactory");
var db = mofac("doccumi");
const publicaHelper = require("../helpers/publicaciones.server.helper");
var entityName = "Entidad(es)";
let mapEstadoEntidades = new Map();
let mapVariants = new Map();
let intFotosEntidadesLength = 0;
let arrFotosEntidades = [];
const strMgr = require("../utils/strManager");
var _ = require('underscore');

mapEstadoEntidades.set("venta", {
  tipo: "success",
  corta: "En Venta",
  larga: "Inventario en Venta",
});
mapEstadoEntidades.set("pendiente", {
  tipo: "info",
  corta: "Pendientes",
  larga: "Inventario Pendientes",
});
mapEstadoEntidades.set("vendido", {
  tipo: "warning",
  corta: "Vendidos",
  larga: "Inventario Vendidos",
});
mapEstadoEntidades.set("taller", {
  tipo: "danger",
  corta: "En Taller",
  larga: "Inventario en Taller",
});
// mapEstadoEntidades.set("activo", {
//   tipo: "info",
//   corta: "Activo",
//   larga: "Activos",
// });

exports.list = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Entidades.find({})
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

  var entity = new db.Entidades(req.body);
  entity.save(function (err) {
    if (err) {
      console.log(__filename + " >> .create: " + JSON.stringify(err));
      res.json({
        status: "FAILED",
        message: `Error en la creación del ${entityName}.`,
        data: err,
      });
    } else {
      if (typeof req.body.entFotos !== "undefined" && req.body.entFotos.length > 0) {
        intFotosEntidadesLength = req.body.entFotos.length;
        req.body.entFotos.forEach(url => {
          // ESTA LINEA HABILITA AL SERVICIO A PUBLICAR LAS FOTOS EN EL MARKETPLACE.
          // FUE DESHABILITADA PARA EVITAR QUE HAGA LA PUBLICACION AL MOMENTO DE LA
          // CREACION DEL VEHICULO. EN SU DEFECTO SE IMPLEMENTARÁ UN BOTÓN EN LA LISTA
          // DE VEHICULOS PARA PUBLICAR DESDE AHI.
          //
          // publicaHelper.download({url: url.replace('https', 'http'), cb: addFilesToArray});
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
  // console.log('addFilesToArray() || file:', file);
  arrFotosEntidades.push(file);
  if (intFotosEntidadesLength === arrFotosEntidades.length) {

    let ctx = {
      "image": arrFotosEntidades,
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

  if (req.body.to === 'instagram') {
    publicaHelper.instagram(ctx).then((resIG) => {
      console.log("result resIG:", resIG);
      result = resIG;
    }).catch((errIG) => {
      console.log("result errIG:", errIG);
      result = resIG;
    });
  }

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

  db.Entidades.findOne({ _id: req.body._id })
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
        _.each(req.body, function (value, key) {
          console.log(key, value);
          entitydb[key] = req.body[key];
        });
        entitydb.entFechaModificacion = new Date();
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

  db.Entidades.deleteOne({ _id: req.params._id }, function (err) {
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

  db.Entidades.findOne({ _id: req.params.id })
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

  db.Entidades.find({})
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

  // db.Entidades.find({})
  const dueno = req.params.dueno === "null" ? null : req.params.dueno;

  db.Entidades.find({entDueno: dueno})
  // db.Entidades.find({})
    .select("-__v")
    // .where('entDueno').eq(req.params.dueno)
    .where("estado")
    .ne("borrado")
    .sort({ entNoRegistroPlaca: 1 })
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
        data.forEach((dato) => {
          let entEstado = dato.entEstado;
          if (mapGroup.has(entEstado)) {
            let grupo = mapGroup.get(entEstado);
            grupo.cantidad = grupo.cantidad + 1;
            grupo.monto = grupo.monto + dato.entPrecio || 0;
            mapGroup.set(entEstado, grupo);
            // console.log("grupo A:", grupo);
          } else {
            console.log("entEstado", entEstado);
            let estent = mapEstadoEntidades.get(entEstado);
            let grupo = {
              tipo: estent?.tipo,
              cantidad: 1,
              descripcion_larga: estent.larga,
              descripcion_corta: estent.corta,
              monto: dato.entPrecio || 0,
            };
            // console.log("grupo B:", grupo);
            mapGroup.set(entEstado, grupo);
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

  const dueno = req.params.dueno === "null" ? null : req.params.dueno;

  db.Entidades.find({entDueno: dueno})
    .select("-__v")
    .where("plaEstado").ne("borrado")
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
