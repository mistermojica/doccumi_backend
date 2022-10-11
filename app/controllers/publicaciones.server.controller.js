const mofac = require("../../config/ModelFactory");
const db = mofac("doccumi");
const entityName = "Publicación(s)";
const _ = require("underscore");
let intFotosVehiculosLength = 0;
let arrFotosVehiculos = [];
const publicaHelper = require("../helpers/publicaciones.server.helper");

exports.publish = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('req.body:', req.body);

  // ME QUEDE PENDIENTE DE RESOLVER LAS PUBLICACIONES DE FOTOS EN REDES SOCIALES DE
  // ESPECIFICAMENTE DETERMINAR SI ENVIO EL INVENTARIO COMPLETO A LA FUNCION DOWNLOAD
  // O BUSCAR UNA FORMA DE GENERAR LAS RUTAS ABSOLUTAS Y ALMACENARLAS.

  if (req.body.inventario.vehFotos.length > 0) {
    intFotosVehiculosLength = req.body.photos.length;
    req.body.inventario.vehFotos.forEach(url => {
      publicaHelper.download({
        inventario,
        // url: url.replace('https', 'http'),
        // image: req.body.image,
        
        cb: addFilesToArray
      });
    });
  }

  getConfiguraciones({conDueno: req.body.dueno})
  .then((resConf) => {
    console.log({resConf});
    const ctxConfig = {...req.body, ...resConf};
    console.log({ctxConfig});

    if (req.body.to === 'instagram' && ctx.conIGUsuario && ctx.conIGContrasena) {
      publicaHelper.instagram(ctxConfig)
      .then((resIG) => {
        console.log("result resIG:", resIG);
        res.json({
          success: true,
          message: `${entityName} en Instagram realizada de forma exitosa.`,
          result: resIG,
        });
      })
      .catch((errIG) => {
        console.log("result errIG:", errIG);
        res.json({
          success: false,
          message: `Error inesperado al realizar ${entityName} en Instagram.`,
          result: errIG,
        });
      });
    }
  
    if (req.body.to === 'marketplace' && ctx.conFBUsuario && ctx.conFBContrasena) {
      publicaHelper.marketplace(ctxConfig)
      .then((resMP) => {
        console.log("result resMP:", resMP);
        res.json({
          success: true,
          message: `${entityName} en Market Place realizada de forma exitosa.`,
          result: resMP,
        });
      })
      .catch((errMP) => {
        console.log("result errMP:", errMP);
        res.json({
          success: false,
          message: `Error inesperado al realizar ${entityName} en Market Place.`,
          result: errMP,
        });
      });
    }
  })
  .catch((errConf) => {
    console.log({errConf});
    res.json({
      success: false,
      message: `Error inesperado al realizar ${entityName}.`,
      result: errConf,
    });
  });
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

function respuesta(res, ctx){
  res.json({
    status: "SUCCESS",
    message: `${entityName} realizada exitosamente.`,
    data: result,
  });
}

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
