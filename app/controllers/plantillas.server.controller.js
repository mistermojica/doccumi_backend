var mofac = require("../../config/ModelFactory");
var db = mofac("documi");
var strMgr = require("../utils/strManager");
var entityName = "Plantilla(s)";
var _ = require("underscore");

exports.list = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Plantillas.find({})
    .select("-plaContenido")
    .where("plaEstado")
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

  var entity = new db.Plantillas(req.body);
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

  db.Plantillas.findOne({ _id: req.body._id })
    .where("plaEstado")
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

        entitydb.plaFechaModificacion = new Date();

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

exports.duplicate = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log("update() || req.body:", req.body);

  db.Plantillas.findOne({ _id: req.params._id })
    .where("plaEstado")
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
        let bodyEntity = strMgr.e2o(entitydb);
        delete bodyEntity._id;
        bodyEntity.plaNombre = bodyEntity.plaNombre + " - (DUPLICADO)";
        let newEntity = new db.Plantillas(bodyEntity);
        newEntity.isNew = true;
        newEntity.plaFechaCreacion = new Date();
        newEntity.plaFechaModificacion = new Date();
        newEntity.save(function (err) {
          if (err) {
            console.log(__filename + " >> .duplicate: " + JSON.stringify(err));
            res.json({
              status: "FAILED",
              message: `Error en la duplicación de ${entityName}.`,
              data: {},
            });
          } else {
            res.json({
              status: "SUCCESS",
              message: `${entityName} se duplicó exitosamente.`,
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

  db.Plantillas.deleteOne({ _id: req.params._id }, function (err) {
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

  db.Plantillas.findOne({ _id: req.params.id })
    .select("-__v")
    .where("plaEstado")
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

  db.Plantillas.find({})
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

exports.findByTipo = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Plantillas.find({ plaTipoDocumento: req.params.tipo })
    .select("-__v -plaContenido")
    .where("plaEstado").equals("activo")
    .populate({
      path: "_estado_",
      select: "codigo nombre -_id",
      match: { isActive: true },
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findByTipo: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener la ${entityName}.`,
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

exports.findByIdTipo = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Plantillas.find({ plaTipoId: req.params.tipoid })
    .select("-__v -plaContenido")
    .where("plaEstado").equals("activo")
    // .populate({
    //   path: "_estado_",
    //   select: "codigo nombre -_id",
    //   match: { isActive: true },
    // })
    .exec(function (err, data) {
      strMgr.mlCL('findByIdTipo() || data:', data);
      if (err) {
        console.log(__filename + " >> .findByIdTipo: " + JSON.stringify(err));
        res.json({
          status: "FAILED",
          message: `Error al obtener la ${entityName}.`,
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

  const dueno = req.params.dueno === "null" ? null : req.params.dueno;

  db.Plantillas.find({plaDueno: dueno})
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
