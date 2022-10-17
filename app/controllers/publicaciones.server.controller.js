const mofac = require("../../config/ModelFactory");
const db = mofac("doccumi");
const entityName = "Publicación(s)";
const _ = require("underscore");
let intFotosVehiculosLength = 0;
let arrFotosVehiculos = [];
let mapInventariosToPublish = new Map();
const publicaHelper = require("../helpers/publicaciones.server.helper");

exports.publish = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('req.body:', req.body);

  // ME QUEDE PENDIENTE DE RESOLVER LAS PUBLICACIONES DE FOTOS EN REDES SOCIALES DE
  // ESPECIFICAMENTE DETERMINAR SI ENVIO EL INVENTARIO COMPLETO A LA FUNCION DOWNLOAD
  // O BUSCAR UNA FORMA DE GENERAR LAS RUTAS ABSOLUTAS Y ALMACENARLAS.

  const inventario = req.body.inventario;
  const to = req.body.to;

  if (req.body.inventario.vehFotos.length > 0) {
    intFotosVehiculosLength = inventario.vehFotos.length;
    mapInventariosToPublish.set(inventario._id, inventario);
    inventario.vehFotos.forEach((url) => {
      publicaHelper.download({
        "res": res,
        "id": inventario._id,
        "to": to,
        "url": url.replace('https', 'http'),
        "cb": addFilesToArray
      });
    });
  }
};

exports.loginrrss = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('loginrrss() || body:', req.body);

  loginRRSS(req.body).then((resPublish) => {
    res.json(resPublish);
  }).catch((errPublish) => {
    res.json(errPublish);
  });
};

exports.list = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Publicaciones.find({})
    .where("pubEstado")
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

  console.log("create() || req.body:", req.body);

  var entity = new db.Publicaciones(req.body);
  entity.save(function (err) {
    if (err) {
      console.log(__filename + " >> .create: " + JSON.stringify(err));
      res.json({
        status: "FAILED",
        message: `Error en la creación del ${entityName}.`,
        data: err,
      });
    } else {
      res.json({
        status: "SUCCESS",
        message: `${entityName} creado exitosamente.`,
        data: entity,
      });
    }
  });
};

exports.update = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log("update() || req.body:", req.body);

  db.Publicaciones.findOne({ _id: req.body._id })
    .where("pubEstado")
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

        entitydb.pubFechaModificacion = new Date();

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

  db.Publicaciones.deleteOne({ _id: req.params._id }, function (err) {
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

  db.Publicaciones.findOne({ _id: req.params.id })
    .select("-__v")
    .where("pubEstado")
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

exports.findByDueno = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  let dueno = req.params.dueno === "null" ? null : req.params.dueno;

  // db.Publicaciones.find({})
  db.Publicaciones.find({ $or: [{ pubDueno: dueno }, { pubDueno: null }] })
    .select("-__v")
    .where("pubEstado")
    .ne("borrado")
    .sort("pubOrden")
    .populate({
      path: "_estado_",
      select: "codigo nombre -_id",
      match: { isActive: true },
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findByDueno: " + JSON.stringify(err));
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

  db.Publicaciones.find({})
    .select("-__v")
    .where("pubEstado")
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

const publishToRRSS = (ctx) => {
  var promise = new Promise(function (resolve, reject) {

    console.log('publishToRRSS:', {ctx});

    getConfiguraciones({conDueno: ctx.vehDueno})
    .then((resConf) => {
      console.log({resConf});
      const ctxConfig = {...ctx, ...resConf};
      console.log({ctxConfig});

      if (ctx.to === 'instagram' && ctxConfig.conIGUsuario && ctxConfig.conIGContrasena) {
        publicaHelper.instagram(ctxConfig)
        .then((resIG) => {
          console.log("result resIG:", resIG);
          resolve({
            success: true,
            message: `${entityName} en Instagram realizada de forma exitosa.`,
            result: resIG,
          });
        })
        .catch((errIG) => {
          console.log("result errIG:", errIG);
          reject({
            success: false,
            message: `Error inesperado al realizar ${entityName} en Instagram.`,
            result: errIG,
          });
        });
      }
    
      if (ctx.to === 'marketplace' && ctxConfig.conFBUsuario && ctxConfig.conFBContrasena) {
        publicaHelper.marketplace(ctxConfig)
        .then((resMP) => {
          console.log("result resMP:", resMP);
          resolve({
            success: true,
            message: `${entityName} en Market Place realizada de forma exitosa.`,
            result: resMP,
          });
        })
        .catch((errMP) => {
          console.log("result errMP:", errMP);
          reject({
            success: false,
            message: `Error inesperado al realizar ${entityName} en Market Place.`,
            result: errMP,
          });
        });
      }
    })
    .catch((errConf) => {
      console.log({errConf});
      reject({
        success: false,
        message: `Error inesperado al realizar ${entityName}.`,
        result: errConf,
      });
    });
  });

  return promise;
};

function getConfiguraciones(ctx) {
  console.log({ctx});

  var promise = new Promise(function (resolve, reject) {

    db.Configuraciones
    .findOne({conDueno: ctx.conDueno})
    .where("conEstado")
    .ne("borrado")
    .lean()
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .getConfiguraciones: " + JSON.stringify(err));
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });

  return promise;
}

function addFilesToArray(ctx) {
  // console.log('addFilesToArray():', {ctx});
  arrFotosVehiculos.push(ctx.file);

  if (intFotosVehiculosLength === arrFotosVehiculos.length) {

    const inventario = mapInventariosToPublish.get(ctx.id);

    const vehPrecio = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inventario.vehPrecio);

    let ctxSend = {
      "vehDueno": inventario.vehDueno,
      "to": ctx.to,
      "image": arrFotosVehiculos,
      "caption" : inventario.vehMarca + ' ' + inventario.vehModelo + ' ' + inventario.vehAnoFabricacion + '\r\n' + 'Tipo: ' + inventario.vehTipoVehiculo + '\r\n' + 'Color: ' + inventario.vehColor + '\r\n' + 'Combustible: ' + inventario.vehTipoEmision + '\r\n' + 'Precio: ' + vehPrecio,
      "location" : "Santo Domingo, Dominican Republic",
      "year": inventario.vehAnoFabricacion,
      "brand": inventario.vehMarca,
      "model": inventario.vehModelo,
      "show": true
    }

    publishToRRSS(ctxSend).then((resPublish) => {
      ctx.res.json(resPublish);
    }).catch((errPublish) => {
      ctx.res.json(errPublish);
    });
  }
}

function respuesta(res, ctx){
  res.json({
    status: "SUCCESS",
    message: `${entityName} realizada exitosamente.`,
    data: result,
  });
}

const loginRRSS = (ctx) => {
  var promise = new Promise(function (resolve, reject) {

    console.log('loginRRSS:', {ctx});

    if (ctx?.to === 'instagram') {
      if (ctx?.conIGUsuario && ctx?.conIGContrasena) {
        publicaHelper.instagramlogin(ctx).then((resIG) => {
          console.log("result resIG:", resIG);
          resolve({
            success: true,
            message: `Login en Instagram realizado de forma exitosa.`,
            result: resIG,
          });
        })
        .catch((errIG) => {
          console.log("result errIG:", errIG);
          reject({
            success: false,
            message: `Error al realizar Login en Instagram.`,
            result: errIG,
          });
        });
      } else {
        reject({
          success: false,
          message: `Error en las credenciales de Instagram.`,
          result: {},
        });
      }
    }

    if (ctx?.to === 'marketplace') {
      if (ctx?.conFBUsuario && ctx?.conFBContrasena) {
        publicaHelper.marketplacelogin(ctx).then((resIG) => {
          console.log("result resIG:", resIG);
          resolve({
            success: true,
            message: `Login en Marketplace realizado de forma exitosa.`,
            result: resIG,
          });
        })
        .catch((errIG) => {
          console.log("result errIG:", errIG);
          reject({
            success: false,
            message: `Error al realizar Login en Marketplace.`,
            result: errIG,
          });
        });
      } else {
        reject({
          success: false,
          message: `Error en las credenciales de Marketplace.`,
          result: {},
        });
      }
    }
  });

  return promise;
};