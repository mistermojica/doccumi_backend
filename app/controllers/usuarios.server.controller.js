const HttpStatus = require('http-status-codes');
const mofac = require('../../config/ModelFactory');
const db = mofac("documi");
const entityName = "Usuario(s)";
const cdkencmgr = require("../utils/encryptionManager");
const jwt = require("jsonwebtoken");
const _ = require('underscore');

exports.login = function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    req.body.usuario = req.body.usuario || req.body.email;
    req.body.contrasena = req.body.contrasena || req.body.password;

    console.log(req.body);

    db.Usuarios.
    findOne({$or: [{usuario: req.body.email}, {usuario: req.body.usuario}]}).
    where("estado").ne("borrado").
    lean().
    // populate({
    //     path: "_tipousuario_",
    //     select: "codigo nombre",
    //     select: "-__v",
    //     match: {estado: "activo"}
    // }).
    // populate({
    //     path: '_proveedores_',
    //     select: "-__v",
    //     populate: {
    //         path: 'empresa',
    //         select: "-__v",
    //         model: 'Empresas',
    //         match: {estado: "activo"},
    //     },
    //     match: {estado: "activo"}
    // }).
    populate({
        path: "_estado_",
        select: "codigo nombre",
        match: {isActive: true}
    }).
    exec(function (err, entity) {
        if (err){
            console.log(__filename + ' >> .login: ' + JSON.stringify(err));
            res.status(HttpStatus.BAD_REQUEST).json({success: false, message: "Error inesperado al hacer login. Por favor intente nuevamente.", result: err});
        }
        else {
            console.log(entity);

            if (!entity) {
                res.status(HttpStatus.FORBIDDEN).json({success: false, message: 'Usuario o Contraseña inválido. Favor intente nuevamente.', result: {}});
            } else if (entity) {
                if (entity.contrasena != (req.body.contrasena)) {
                // if (entity.contrasena != cdkencmgr.encryptsha(req.body.contrasena)) {
                    res.status(HttpStatus.UNAUTHORIZED).json({success: false, message: 'Usuario o Contraseña inválido. Favor intente nuevamente.', result: {}});
                } else {
                    var dataObj = JSON.parse(JSON.stringify(entity));
                    _generateToken(dataObj).then((tokenRes) => {
                        dataObj.token = tokenRes.result.token;
                        dataObj.rolToken = cdkencmgr.encryptapp("usuario");
                        res.status(HttpStatus.OK).json({success: true, message: 'Login realizado exitosamente.', result: dataObj});
                    }).
                    catch((tokenErr) => {
                        console.log("tokenErr:", tokenErr);
                        res.status(HttpStatus.BAD_REQUEST).json({success: false, message: 'Error inesperado al generar el token de usuario.', result: tokenErr});
                    });
                }
            }
        }
    });
};

function _generateToken(ctx) {

    var promise = new Promise(function(resolve, reject) {

        var payload = {
            usuario: ctx.usuario,
            proveedor: "",
            empresa: "",
            empleado: ""
        }

        console.log("payload:", payload);

        var datatoken = cdkencmgr.encryptbackoffice(payload);

        var tokentime = {
            code: jwt.sign({data: datatoken}, process.env.TOKEN_SECRET, {expiresIn: '1h'}),
            expires: {time: 1, type: 'h'}
        }

        var ctxSave = {
            tokentime       : tokentime.code,
            token           : datatoken,
            usuario         : ctx.usuario,
            tipo            : "usuario",
            expira_tiempo   : tokentime.expires.time,
            expira_medida   : tokentime.expires.type,
            estado          : "activo"
        }

        var result = {
            token: datatoken,
            expires: tokentime.expires
        }

        var entity = new db.Tokentimes(ctxSave);
        entity.save(function(err) {
            if (err) {
                console.log(__filename + ' >> .create: ' + JSON.stringify(err));
                reject({success: false, message: `Error en la creación de Token de Usuario.`, result: {}});
            }
            else {
                resolve({success: true, message: `Token de Usuario generado exitosamente`, result: result});
            }
        });

    });

    return promise;
};

exports.create = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var entity = new db.Usuarios(req.body);
    entity.save(function(err) {
        if (err) {
            console.log(__filename + ' >> .create: ' + JSON.stringify(err));
            res.json({success: false, message: `Error en la creación de ${entityName}.`, result: {}});
        }
        else {
            res.json({success: true, message: `${entityName} se creó exitosamente.`, result: entity});
        }
    });
};

exports.update = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Usuarios.
    findOne({_id: req.body._id}).
    where("estado").ne("borrado").
    exec(function(err, entitydb) {
        if (err) {
            console.log(__filename + ' >> .update: ' + JSON.stringify(err));
            res.json({success: false, message: `Error al obtener ${entityName}.`, result: {}});
        }
        else {
            entitydb.usuario                = req.body.usuario;
            entitydb.contrasena             = cdkencmgr.encryptsha(req.body.contrasena);
            entitydb.nombre                 = req.body.nombre;
            entitydb.telefono               = req.body.telefono;
            entitydb.whatsapp               = req.body.whatsapp;
            entitydb.email                  = req.body.email;
            entitydb.tipo                   = req.body.tipo;
            entitydb.estado                 = req.body.estado;
            entitydb.puede_admin_ofertas    = req.body.puede_admin_ofertas;
            entitydb.puede_admin_empleados  = req.body.puede_admin_Usuarios;
            entitydb.puede_admin_sucursales = req.body.puede_admin_sucursales;
            entitydb.fecha_modificacion     = new Date();

            entitydb.save(function(err) {
                if (err) {
                    console.log(__filename + ' >> .update: ' + JSON.stringify(err));
                    res.json({success: false, message: `Error en la actualización de ${entityName}.`, result: {}});
                }
                else {
                    res.json({success: true, message: `${entityName} se actualizó exitosamente.`, result: entitydb});
                }
            });
        }
    });
};

exports.list = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Usuarios.
        find({}).
        where("estado").ne("borrado").
        exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .list: ' + JSON.stringify(err));
            res.json({success: false, message: `Error en la lista de ${entityName}s.`, result: {}});
        }
        else {
            res.json({success: true, message: `Lista de ${entityName}s generada exitosamente.`, result: data});
        }
    });
};

exports.listpop = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Usuarios.
        find({}).
        select("-__v").
        where("estado").ne("borrado").
        lean().
        // populate({
        //     path: "_tipousuario_",
        //     select: "-__v",
        //     match: {estado: "activo"}
        // }).
        // populate({
        //     path: "_empresas_",
        //     select: "-__v",
        //     match: {estado: "activo"}
        // }).
        populate({
            path: "_estado_",
            select: "codigo nombre",
            match: {isActive: true}}).
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
                res.json({success: false, message: `Error al obtener ${entityName}.`, result: {}});
            }
            else {
                res.json({success: true, message: `Lista de ${entityName}s generada exitosamente.`, result: data});
            }
        });
};

exports.findById = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Usuarios.
    findOne({_id: req.params.id}).
    select("-__v").
    where("estado").ne("borrado").
    lean().
    // populate({
    //     path: "_tipousuario_",
    //     select: "-__v",
    //     match: {estado: "activo"}
    // }).
    // populate({
    //     path: "_empresas_",
    //     select: "-__v",
    //     match: {estado: "activo"}
    // }).
    populate({
        path: "_estado_",
        select: "codigo nombre",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
            res.json({success: false, message: `Error al obtener ${entityName}.`, result: {}});
        }
        else {
            res.json({success: true, message: `${entityName} se encontró exitosamente.`, result: data});
        }
    });
};

exports.profile = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    db.Usuarios.
    findOne({_id: req.params._id}).
    select("-__v").
    where("estado").ne("borrado").
    lean().
    // populate({
    //     path: "_tipousuario_",
    //     select: "-__v",
    //     match: {estado: "activo"}
    // }).
    // populate({
    //     path: "_empresas_",
    //     select: "-__v",
    //     match: {estado: "activo"}
    // }).
    populate({
        path: "_estado_",
        select: "codigo nombre",
        match: {isActive: true}
    }).
    exec(function(err, data) {
        if (err) {
            console.log(__filename + ' >> .findById: ' + JSON.stringify(err));
            res.json({success: false, message: `Error al obtener ${entityName}.`, result: {}});
        }
        else {
            res.json({success: true, message: `${entityName} se encontró exitosamente.`, result: data});
        }
    });
};

function mlCL(paramMsg, paramData){
    // console.log('\r\n==================');
    // console.log(paramMsg);
    // console.log('\r\n');
    // console.log(paramData);
    // console.log('======================');
}