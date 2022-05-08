var mofac = require('../../config/ModelFactory');
var db = mofac("documi");
var entityName = "Vehículo(s)";

exports.list = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Vehiculos.
    find({}).
    where("estado").ne("borrado").
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

    console.log("req.body:", req.body);

    var entity = new db.Vehiculos(req.body);
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

    console.log("req.body:", req.body);

    db.Vehiculos.
    findOne({_id: req.body._id}).
    where("estado").ne("borrado").
    exec(function(err, entitydb) {
        if (err) {
            console.log(__filename + ' >> .update: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener ${entityName}.`, data: {}});
        }
        else {
            entitydb.vehNoRegistroPlaca      = req.body.vehNoRegistroPlaca;
            entitydb.vehChasis               = req.body.vehChasis;
            entitydb.vehStatusVehiculo       = req.body.vehStatusVehiculo;
            entitydb.vehTipoEmision          = req.body.vehTipoEmision;
            entitydb.vehTipoVehiculo         = req.body.vehTipoVehiculo;
            entitydb.vehAnoFabricacion       = req.body.vehAnoFabricacion;
            entitydb.vehMarca                = req.body.vehMarca;
            entitydb.vehModelo               = req.body.vehModelo;
            entitydb.vehColor                = req.body.vehColor;
            entitydb.vehPrecio               = req.body.vehPrecio;
            entitydb.vehCosto                = req.body.vehCosto;
            entitydb.vehFotoMatricula        = req.body.vehFotoMatricula;
            entitydb.vehEstado               = req.body.vehEstado;
            entitydb.vehFechaModificacion    = new Date();
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

    db.Vehiculos.
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

    db.Vehiculos.
    findOne({_id: req.params.id}).
    select("-__v").
    where("estado").ne("borrado").
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

exports.listpop = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Vehiculos.
    find({}).
    select("-__v").
    where("estado").ne("borrado").
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