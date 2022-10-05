var mofac = require('../../config/ModelFactory');
var db = mofac("doccumi");
var entityName = "Soporte(s)";
var _ = require('underscore');
const strMgr = require("../utils/strManager");

exports.list = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Soportes.
    find({}).
    where("sopEstado").ne("borrado").
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .list: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error en la lista de ${entityName}.`, data: {}});
        }
        else {
            console.log("data:", data);
            res.json({status: "SUCCESS", message: `Lista de ${entityName} generada exitosamente.`, data: data});
        }
    });
};

exports.create = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("create() || req.body:", req.body);

    var entity = new db.Soportes(req.body);
    entity.save(function(err) {
        if (err) {
            console.log(__filename + ' >> .create: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error en la creación del ${entityName}.`, data: err});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} creado exitosamente.`, data: entity});
        }
    });
};

exports.update = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("update() || req.body:", req.body);

    db.Soportes.
    findOne({_id: req.body._id}).
    where("sopEstado").ne("borrado").
    exec(function(err, entitydb) {
        if (err) {
            console.log(__filename + ' >> .update: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener ${entityName}.`, data: {}});
        }
        else {
            _.each(req.body, function (value, key) {
                console.log(key, value);
                entitydb[key] = req.body[key];
            });

            entitydb.plaFechaModificacion   = new Date();

            entitydb.save(function(err) {
                if (err) {
                    console.log(__filename + ' >> .update: ' + JSON.stringify(err));
                    res.json({status: "FAILED", message: `Error en la actualización de ${entityName}.`, data: {}});
                }
                else {
                    res.json({status: "SUCCESS", message: `${entityName} se actualizó exitosamente.`, data: entitydb});
                }
            });
        }
    });
};

exports.delete = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Soportes.
    deleteOne({_id: req.params.id}, function(err){
        if (err) {
            console.log(__filename + ' >> .delete: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al eliminar ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} se eliminó exitosamente.`, data: {}});
        }
    });
};

exports.findById = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Soportes.
    findOne({_id: req.params.id}).
    select("-__v").
    where("sopEstado").ne("borrado").
    populate({
        path: "_estado_", 
        select: "codigo nombre -_id",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} encontrado exitosamente.`, data: data});
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
  
    db.Soportes.
    find({ $or: [{ sopDueno: dueno }] })
      .select("-__v")
      .where("sopEstado").ne("borrado")
      .populate({
        path: "_estado_",
        select: "codigo nombre -_id",
        match: { isActive: true },
      })
      .exec(function (err, data) {
        strMgr.mlCL("findByDueno() || data:", data);
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

exports.findByTipo = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Soportes.
    find({sopTipo: req.params.tipo}).
    select("-__v").
    where("sopEstado").ne("borrado").
    sort("sopNombre").
    populate({
        path: "_estado_", 
        select: "codigo nombre -_id",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findByTipo: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} encontrado exitosamente.`, data: data});
        }
    });
};

exports.findByTipoDueno = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    const dueno = req.params.dueno === "null" ? null : req.params.dueno;

    const query = {sopTipo: req.params.tipo, $or:[{"sopDueno": dueno}, {"sopDueno": null}]}

    db.Soportes.
    find(query).
    select("-__v").
    where("sopEstado").ne("borrado").
    sort("sopNombre").
    populate({
        path: "_estado_", 
        select: "codigo nombre -_id",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        strMgr.mlCL("data:", data);

        if (err) {
            console.log(__filename + ' >> .findByTipoDueno: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} encontrado exitosamente.`, data: data});
        }
    });
};

exports.listpop = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Soportes.
    find({}).
    select("-__v").
    where("sopEstado").ne("borrado").
    lean().
    populate({
        path: "_estado_",
        select: "codigo nombre"
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener la lista de ${entityName}.`, data: err});
        }
        else {
            res.json({status: "SUCCESS", message: `Lista de ${entityName} generada exitosamente.`, data: data});
        }
    });
};