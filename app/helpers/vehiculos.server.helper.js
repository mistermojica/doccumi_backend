var StatusCodes = require('http-status-codes').StatusCodes;
var strMgr = require("../utils/strManager");
var mofac = require('../../config/ModelFactory');
var db = mofac("documi");
var entityName = 'Rol';

exports._ROMG = function(value) {
    console.log(__filename + ' >> ._ROMG || value: ', value);
}

exports._findById = function(id) {

    var promise = new Promise(function(resolve, reject) {
        db.Empleados.
        findOne({_id: id}).
        where("estado").ne("borrado").
        lean().
        populate({
            path: "_rol_",
            select: "codigo nombre",
            match: {estado: "activo"}}).
        populate({
            path: "_estado_",
            select: "codigo nombre"}).
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> ._findById(): ', err.stack.split("\n"));
                reject(err);
            }
            else {
                resolve(strMgr.e2o(data));
            }
        });
    });

    return promise;
};

exports._findByRol = function(rol) {

    var promise = new Promise(function(resolve, reject) {
        db.Empleados.
        findOne({rol: rol}).
        where("estado").ne("borrado").
        lean().
        populate({
            path: "_rol_",
            select: "codigo nombre",
            match: {estado: "activo"}}).
        populate({
            path: "_estado_",
            select: "codigo nombre"}).
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> ._findByRol(): ', err.stack.split("\n"));
                reject(err);
            }
            else {
                resolve(strMgr.e2o(data));
            }
        });
    });

    return promise;
};

exports._listPop = function() {

    var promise = new Promise(function(resolve, reject) {
        db.Empleados.
        find({}).
        where("estado").ne("borrado").
        lean().
        populate({
            path: "_rol_",
            select: "codigo nombre",
            match: {estado: "activo"}}).
        populate({
            path: "_estado_",
            select: "codigo nombre"}).
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> ._listPop(): ', err.stack.split("\n"));
                reject(err);
            }
            else {
                resolve(strMgr.e2o(data));
            }
        });
    });

    return promise;
};

exports._changeStatus = function(ctx) {

    var promise = new Promise((resolve, reject) => {
        db.Empleados.
        findOne({_id: ctx._id}).
        where("estado").ne("borrado").
        exec((err, entitydb) => {
            if (err) {
                console.log(__filename + ' >> ._changeStatus(): ', err.stack.split("\n"));
                reject({code: StatusCodes.BAD_REQUEST, success: false, message: `Error al obtener ${entityName}.`, result: err.stack.split("\n")});
            }
            else {
                if (entitydb != null){
                    entitydb.estado             = ctx.estado;
                    entitydb.fecha_modificacion = new Date();
                    entitydb.save((err) => {
                        if (err) {
                            console.log(__filename + ' >> ._changeStatus(): ', err.stack.split("\n"));
                            reject({code: StatusCodes.BAD_REQUEST, success: false, message: `Error en la actualización del estado de ${entityName}.`, result: err.stack.split("\n")});
                        }
                        else {
                            resolve({code: StatusCodes.OK, success: true, message: `El estado del ${entityName} fue actualizado exitosamente.`, result: entitydb});
                        }
                    });
                }
                else {
                    reject({code: StatusCodes.NOT_FOUND, success: false, message: `${entityName} no existe.`, result: null});
                }
            }
        });

    });

    return promise;
};