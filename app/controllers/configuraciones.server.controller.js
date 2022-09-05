var mofac = require('../../config/ModelFactory');
var db = mofac("doccumi");
var entityName = "Configuración(es)";
var _ = require('underscore');
const strMgr = require("../utils/strManager");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
    appInfo: { // For sample support and debugging, not required for production:
      name: "stripe-samples/subscription-use-cases/fixed-price",
      version: "0.0.1",
      url: "https://github.com/stripe-samples/subscription-use-cases/fixed-price"
    }
  });

exports.create = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("create() || req.body:", req.body);

    var entity = new db.Configuraciones(req.body);
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

    db.Configuraciones.
    findOne({_id: req.body._id}).
    where("conEstado").ne("borrado").
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

    db.Configuraciones.
    deleteOne({_id: req.params._id}, function(err){
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

    db.Configuraciones.
    findOne({_id: req.params.id}).
    select("-__v").
    where("conEstado").ne("borrado").
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

    db.Configuraciones.find({ $or: [{ conDueno: dueno }] })
      .select("-__v")
      .where("conEstado")
      .ne("borrado")
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

exports.listpop = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Configuraciones.
    find({}).
    select("-__v").
    where("conEstado").ne("borrado").
    sort({orden: 1}).
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

exports.config = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    let prices = [];
    stripe.prices.list({
    // lookup_keys: ['sample_basic', 'sample_premium'],
    // expand: ['data.product'],
    limit: 3
    }).then((resPrices) => {
        prices = resPrices;
        console.log({resPrices});
        const result = {
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            prices: prices.data,
        };
        console.log({result});
        res.send(result);
    })
    .catch((error) => {
        console.error(error)
    });
};