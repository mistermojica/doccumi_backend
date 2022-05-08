var mofac = require('../../config/ModelFactory');
var db = mofac("documi");
var entityName = "Plantilla(s)";
var _ = require('underscore');

exports.list = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Documentos.
    find({}).
    select('-docContenido').
    where("docEstado").ne("borrado").
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

    const {docVehiculo, docCliente, docTipoDocumento} = req.body;

    db.Documentos.
    findOne({docVehiculo, docCliente, docTipoDocumento}).
    where("estado").ne("borrado").
    exec(function (err, data) {
        if (err) {
            console.log(__filename + ' >> .create() || findOne() || err: ' + '\r\n', err);
            res.json({status: "FAILED", message: `Error inesperado al cargar ${entityName}. Por favor intente nuevamente.`, data: err});
        }
        else {
            if (data == null){
                var entity = new db.Documentos(req.body);
                entity.save(function(err) {
                    if (err) {
                        console.log(__filename + ' >> .create1: ' + JSON.stringify(err));
                        res.json({status: "FAILED", message: `Error en la creación del ${entityName}.`, data: err});
                    
                    }
                    else {
                        //mlCL("entity:", entity);
                        res.json({status: "SUCCESS", message: `${entityName} creado exitosamente.`, data: entity});
                    }
                });
            }
            else {
                _.each(req.body, function (value, key) {
                    console.log(key, value);
                    data[key] = req.body[key];
                });

                data.docFechaModificacion = new Date();
                data.save(function(err) {
                    if (err) {
                        console.log(__filename + ' >> .create2: ' + JSON.stringify(err));
                        res.json({status: "FAILED", message: `Error en la actualización de ${entityName}.`, data: {}});
                    }
                    else {
                        res.json({status: "SUCCESS", message: `${entityName} se actualizó exitosamente.`, data: data});
                    }
                });
            }
        }
    });
};

exports.update = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("update() || req.body:", req.body);

    const {docCliente, docVehiculo, docTipoDocumento} = req.body;

    console.log("update() || docCliente:", docCliente);
    console.log("update() || docVehiculo:", docVehiculo);
    console.log("update() || docTipoDocumento:", docTipoDocumento);

    db.Documentos.
    findOne({
        docCliente,
        docVehiculo,
        docTipoDocumento
    }).
    where("docEstado").ne("borrado").
    exec(function(err, entitydb) {
        if (err) {
            console.log(__filename + ' >> .update: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener ${entityName}.`, data: {}});
        }
        else {
            console.log('entitydb 1:', entitydb);

            _.each(req.body, function (value, key) {
                console.log(key, value);
                entitydb[key] = req.body[key];
            });

            entitydb.docFechaModificacion = new Date();
            entitydb.save(function(err) {
                if (err) {
                    console.log(__filename + ' >> .update: ' + JSON.stringify(err));
                    res.json({status: "FAILED", message: `Error en la actualización de ${entityName}.`, data: {}});
                }
                else {
                    console.log('entitydb 2:', entitydb);
                    res.json({status: "SUCCESS", message: `${entityName} se actualizó exitosamente.`, data: entitydb});
                }
            });
        }
    });
};

exports.delete = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Documentos.
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

    db.Documentos.
    findOne({_id: req.params.id}).
    select("-__v").
    where("docEstado").ne("borrado").
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

    db.Documentos.
    find({}).
    select("-__v").
    where("docEstado").ne("borrado").
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

exports.findByTipo = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Documentos.
    find({docTipoDocumento: req.params.tipo}).
    select("-__v -docContenido").
    where("docEstado").equals("activo").
    populate({
        path: "_estado_", 
        select: "codigo nombre -_id",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findByTipo: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener la ${entityName}.`, data: {}});
        }
        else {
            res.json({status: "SUCCESS", message: `${entityName} encontrado exitosamente.`, data: data});
        }
    });
};

exports.buscaPorVehiculoCliente = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log('req.body:', req.body);

    db.Documentos.
    find({docVehiculo: req.body.vehiculo, docCliente: req.body.cliente}).
    select("-__v -docContenido").
    where("docEstado").equals("activo").
    populate({
        path: "_tipo_",
        select: "tipCodigo tipNombre tipOrden",
        match: {tipEstado: 'activo'}
    }).
    populate({
        path: "_estado_", 
        select: "codigo nombre -_id",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .buscaPorVehiculoCliente: ' + JSON.stringify(err));
            res.json({status: "FAILED", message: `Error al obtener la ${entityName}.`, data: {}});
        }
        else {
            console.log('>> .buscaPorVehiculoCliente: ', data);
            res.json({status: "SUCCESS", message: `${entityName} encontrado exitosamente.`, data: data});
        }
    });
};
