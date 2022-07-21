var mofac = require('../../config/ModelFactory');
var db = mofac("documi");
var entityName = "Cliente(s)";
var _ = require('underscore');
var fs = require('fs');
var pdf = require('html-pdf');
var configpdf = require("../../config/pdfconfig")();
var os = require("os");
var urlserver = "";

exports.create = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("req.body:", req.body);

    urlserver = req.headers.host;

    let ctx = {};

    getCliente(req.body).then((resCli) => {
        // console.log("resCli:", resCli);
        ctx.cliente = resCli.data;
        getVehiculo(req.body).then((resVeh) => {
            // console.log("resVeh:", resVeh);
            ctx.vehiculo = resVeh.data;
            getDocumentos(req.body).then((resDoc) => {
                // console.log("resDoc:", resDoc);
                ctx.documentos = resDoc.data;
                getCampos(req.body).then((resCam) => {
                    // console.log("resCam:", resCam);
                    ctx.campos = resCam.data;
                    generaPDF(ctx).then((resPDF) => {
                        console.log("resPDF:", resPDF);
                        let result = {status: "SUCCESS", message: `${entityName} generado exitosamente.`, data: resPDF};
                        res.json(result);
                    })
                    .catch((errPDF) => {
                        console.log("errPDF:", errPDF);
                        reject({status: "FAILED", message: `Error al generar el PDF.`, data: errPDF});            
                    });
                })
                .catch((errCam) => {
                    console.log("errCam:", errCam);
                    reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: errCam});            
                });
            })
            .catch((errDoc) => {
                console.log("errDoc:", errDoc);
                reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: errDoc});            
            });
        })
        .catch((errVeh) => {
            console.log("errVeh:", errVeh);
            reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: errVeh});            
        });
    })
    .catch((errCli) => {
        console.log("errCli:", errCli);
        reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: errCli});            
    });
};

function getCliente(ctx){

    let promesa = new Promise((resolve, reject) => {

        db.Clientes.
        findOne({_id: ctx.impCliente}).
        select("-__v").
        where("cliEstado").ne("borrado").
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> .getCliente: ' + JSON.stringify(err));
                reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
            }
            else {
                resolve({status: "SUCCESS", message: `${entityName} generado exitosamente.`, data: data});
            }
        });
    });

    return promesa;
}

function getVehiculo(ctx){

    let promesa = new Promise((resolve, reject) => {

        db.Vehiculos.
        findOne({_id: ctx.impVehiculo}).
        select("-__v").
        where("vehEstado").ne("borrado").
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> .getVehiculo: ' + JSON.stringify(err));
                reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
            }
            else {
                resolve({status: "SUCCESS", message: `${entityName} generado exitosamente.`, data: data});
            }
        });
    });

    return promesa;
}

function getDocumentos(ctx){

    let promesa = new Promise((resolve, reject) => {

        db.Documentos.
        find({}).
        where('_id').in(ctx.impTiposDocumentos).
        select("-__v").
        where("docEstado").ne("borrado").
        populate({
            path: "_plantilla_",
            // select: "tipCodigo tipNombre tipOrden",
            match: {plaEstado: 'activo'}
        }).
        populate({
            path: "_tipo_",
            select: "tipCodigo tipNombre tipOrden",
            match: {tipEstado: 'activo'}
        }).
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> .getDocumentos: ' + JSON.stringify(err));
                reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
            }
            else {
                resolve({status: "SUCCESS", message: `${entityName} generado exitosamente.`, data: data});
            }
        });
    });

    return promesa;
}

function getCampos(ctx){

    let promesa = new Promise((resolve, reject) => {

        db.Campos.
        find({}).
        where('camEmpresa').equals(null).
        select("-__v").
        where("plaEstado").ne("borrado").
        exec(function(err, data) {
            if (err) {
                console.log(__filename + ' >> .getCampos: ' + JSON.stringify(err));
                reject({status: "FAILED", message: `Error al obtener el ${entityName}.`, data: {}});
            }
            else {
                resolve({status: "SUCCESS", message: `${entityName} generado exitosamente.`, data: data});
            }
        });
    });

    return promesa;
}

function generaPDF(ctx){

    let promesa = new Promise((resolve, reject) => {

        var promesas = [];

        ctx.documentos.forEach(documento => {

            let ctxdoc = {
                cliente: ctx.cliente,
                vehiculo: ctx.vehiculo,
                documento: documento,
                campos: ctx.campos
            }

            // console.log("ctxdoc:", ctxdoc);

            let promesa = procesaDocumento(ctxdoc)
            .then((resPD) => {
                // console.log('resPD:', resPD);
                return resPD;
            })
            .catch((errPD) => {
                console.log('errPD:', errPD);
                return errPD;
            });

            promesas.push(promesa);

        });

        Promise.all(promesas)
        .then((resPA) => {
            console.log('resPA:', resPA);
            resolve(resPA);
        })
        .catch((errPA) => {
            console.log('errPA:', errPA);
            reject(errPA);
        });

    });

    return promesa;
}

function procesaDocumento(ctx){

    let promesa = new Promise((resolve, reject) => {

        let plantilla = ctx.documento._plantilla_.plaContenido;
        let tipo = ctx.documento._tipo_;
        let cliente = ctx.cliente;
        let vehiculo = ctx.vehiculo;
        let campos = ctx.campos;

        campos.forEach((campo) => {
            let placeholder = '{' + campo.camNombre + '}';
            let buscador = new RegExp(placeholder, 'g');
            let reemplazo = "";
            if (['vehFotoMatricula', 'cliFotoCedula'].includes(campo.camCampo)) {
                let fotos = vehiculo[campo.camCampo] || cliente[campo.camCampo];
                if (Array.isArray(fotos) && fotos.length > 1) {
                    fotos.forEach(foto => {
                        reemplazo = reemplazo + `<img src="${foto}" width="200px" style="margin: 2px;">`;
                    });
                } else {
                    reemplazo = `<img width="300px" src="${fotos[0]}">`;
                }
            } else {
                reemplazo = vehiculo[campo.camCampo] || cliente[campo.camCampo];
            }
            plantilla = plantilla.replace(buscador, reemplazo);
        });
        console.log("plantilla D:", plantilla);

        pdf.create(plantilla, configpdf).toFile('./public/'.concat(ctx.documento.docTipoDocumento).concat(".pdf"), function(err, res) {
            if (err){
                console.log("err:", err);
                reject(err);
            }
            else {
                let resOut = res.filename.split("/public/");
                let docUrl = "http://".concat(urlserver).concat("/").concat(resOut[1]);
                console.log("docUrl:", docUrl);
                resolve({"tipo": tipo.tipNombre, "documento": docUrl});
            }
        });
    });

    return promesa;
}
