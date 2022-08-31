const mofac = require('../../config/ModelFactory');
const db = mofac("doccumi");
const entityName = "Impresión(es)";
const _ = require('underscore');
const fs = require('fs');
const pdf = require('html-pdf');
const HTMLtoDOCX = require('html-to-docx');
const configpdf = require("../../config/pdfconfig")();
const imageToBase64 = require('image-to-base64');
const { v4: uuidv4 } = require('uuid');
var HtmlDocx = require('html-docx-js');

let urlserver = "";

exports.create = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    console.log("req.body:", req.body);

    urlserver = req.headers.host.replace('443', '');

    let ctx = {tipos: req.body.impTipos};

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
                    generaDocumento(ctx).then((resGD) => {
                        let result = {status: "SUCCESS", message: `${entityName} generado exitosamente.`, data: resGD};
                        console.log('result:', JSON.stringify(result));
                        res.json(result);
                    })
                    .catch((errGD) => {
                        console.log("errGD:", errPDF);
                        reject({status: "FAILED", message: `Error al generar el PDF.`, data: errGD});            
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

        let dueno = ctx.impDueno === "null" ? null : ctx.impDueno;

        db.Campos.find({ $or: [{ camDueno: dueno }, { camTipo: 'publico' }] })
        .select("-__v")
        .where("camEstado")
        .ne("borrado")
        .sort("camOrden")
        .exec(function(err, data) {
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

function generaDocumento(ctx){

    let promesa = new Promise((resolve, reject) => {

        var promesas = [];

        ctx.documentos.forEach(documento => {

            let ctxdoc = {
                tipos: ctx.tipos,
                cliente: ctx.cliente,
                vehiculo: ctx.vehiculo,
                documento: documento,
                campos: ctx.campos
            }

            let promesa = procesaDocumento(ctxdoc)
            .then((resPD) => {
                return resPD;
            })
            .catch((errPD) => {
                console.log('errPD:', errPD);
                return errPD;
            });

            promesas.push(promesa);

        });

        Promise.all(promesas)
        .then((resGD) => {
            resolve(resGD);
        })
        .catch((errGD) => {
            console.log('errGD:', errGD);
            reject(errGD);
        });

    });

    return promesa;
}

function procesaDocumento(ctx){

    let promesa = new Promise((resolve, reject) => {

        let plantilla = ctx.documento._plantilla_.plaContenido;
        let cliente = ctx.cliente;
        let vehiculo = ctx.vehiculo;
        let campos = ctx.campos;
        let campoAdicionalesV = new Map(vehiculo.vehCamposAdicionales.map(campo => {
            return [campo.name.replace('doccumi_cf_', ''), campo.value];
        }));
        let camposAdicionalesC = new Map(cliente.cliCamposAdicionales.map(campo => {
            return [campo.name.replace('doccumi_cf_', ''), campo.value];
        }));

        campos.forEach((campo) => {
            let placeholder = '{' + campo.camNombre + '}';
            let buscador = new RegExp(placeholder, 'g');
            let reemplazo = "";

            if (['vehFotoMatricula', 'vehFotos', 'cliFotoCedula'].includes(campo.camCampo)) {
                let fotos = vehiculo[campo.camCampo] || cliente[campo.camCampo];
                let fotoWidth = '';
                switch (campo.camCampo) {
                    case 'vehFotoMatricula':
                        fotoWidth = '500px';
                        break;
                    case 'vehFotos':
                        fotoWidth = '200px';
                        break;
                    case 'cliFotoCedula':
                        fotoWidth = '300px';
                        break;
                    default:
                        fotoWidth = '200px';
                        break;
                }

                if (Array.isArray(fotos) && fotos.length > 1) {
                    // reemplazo = '<style>img {width: 100px;} table {border: 3px solid white;}</style><table><tr>';
                    // let colcounter = 0;
                    fotos.forEach(foto => {
                        // (async () => {
                            // const foto64 = await getImageBase64(foto);
                        // })();
                        // if (colcounter < 2){
                            reemplazo = reemplazo + `<img width="${fotoWidth}" src="${foto}" style="margin: 3px;">`;
                            // if (ctx.tipos.includes('docx')) {
                            //     reemplazo = reemplazo + `<br><br><br><br>`;
                            // }
                            // reemplazo = reemplazo + `<td><img width="200px" src="${foto}" style="width:200px"></td>`;
                            // colcounter = colcounter + 1;
                        // } else {
                            // reemplazo = reemplazo + '</tr><tr>';
                            // colcounter = 0;s
                        // }
                    });
                    // reemplazo = reemplazo + '</tr></table>';
                    // console.log({reemplazo});
                } else {
                    // console.log('fotos[0]:', fotos[0]);
                    reemplazo = `<img width="${fotoWidth}" src="${fotos[0]}" style="margin: 3px;">`;
                }
                // console.log('reemplazo:', reemplazo);
            } else if (campoAdicionalesV.get(campo.camCampo) || camposAdicionalesC.get(campo.camCampo)) {
                reemplazo = campoAdicionalesV.get(campo.camCampo) || camposAdicionalesC.get(campo.camCampo);
            } else {
                reemplazo = vehiculo[campo.camCampo] || cliente[campo.camCampo];
            }
            plantilla = plantilla.replace(buscador, reemplazo);
        });

        ctx.plantilla = plantilla;
        ctx.tipo = ctx.documento._tipo_;
        ctx.configpdf = configpdf;

        const arrDocsPromesas = [];

        if (ctx.tipos.includes('pdf')) {
            ctx.tipo_documento = 'pdf';
            const creaPDFPromise = creaArchivo({...ctx})
            .then((resCA) => {
                return resCA;
            })
            .catch((errCA) => {
                console.log('pdf:', {errCA});
                return errCA;
            });
            arrDocsPromesas.push(creaPDFPromise);
        }

        if (ctx.tipos.includes('docx')) {
            ctx.tipo_documento = 'docx';
            const creaDOCXPromise = creaArchivo({...ctx})
            .then((resCA) => {
                return resCA;
            })
            .catch((errCA) => {
                console.log('docx:', {errCA});
                return errCA;
            });
            arrDocsPromesas.push(creaDOCXPromise);
        }

        Promise.all(arrDocsPromesas)
        .then((docs) => {
            const docsOut = {tipo: ctx.tipo.tipNombre, documentos: []};
            docs.forEach(doc => {
                const nDoc = {...doc};
                delete nDoc.tipo;
                docsOut.documentos.push(nDoc);
            });
            resolve(docsOut);
        })
        .catch((error) => {
            console.log('procesaDocumento() || error:', error);
            reject(error);
        });
    });

    return promesa;
}

function getImageBase64(imgSrc) {
    const pre = 'data:image/png;base64, ';
    return new Promise((resolve, reject) => {
        imageToBase64(imgSrc)
        .then((res) => {
            return resolve(pre + res);
        })
        .catch((error) => {
            return reject(error);
        });
    });
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function creaArchivo(ctx){

    const uuidCode = uuidv4();

    let promesa = new Promise((resolve, reject) => {

        if (ctx.tipo_documento === 'pdf') {

            const filePath = './public/'.concat(ctx.documento.docTipoDocumento).concat('_').concat(uuidCode).concat(".pdf");

            pdf.create(ctx.plantilla, ctx.configpdf).toFile(filePath, function(err, res) {
                if (err){
                    console.log("creaArchivo() | err:", err);
                    reject(err);
                }
                else {
                    const resOut = res.filename.split("/public/");
                    const docUrl = "http://".concat(urlserver).concat("/").concat(resOut[1]);
                    resolve({"tipo": ctx.tipo.tipNombre, "documento": docUrl, "doc": ctx.tipo_documento});
                }
            });
        }

        if (ctx.tipo_documento === 'docx') {

            const filePath = './public/'.concat(ctx.documento.docTipoDocumento).concat('_').concat(uuidCode).concat(".docx");

            var docx = HtmlDocx.asBlob(ctx.plantilla);
            fs.writeFile(filePath, docx, function(error) {
                if (error) {
                    console.log(filePath, 'Docx file creation failed', error);
                    reject(error);
                } else {
                    const resOut = filePath.split("/public/");
                    const docUrl = "http://".concat(urlserver).concat("/").concat(resOut[1]);
                    resolve({"tipo": ctx.tipo.tipNombre, "documento": docUrl, "doc": ctx.tipo_documento});
                }
            });

            // (async () => {
            //     const fileBuffer = await HTMLtoDOCX(ctx.plantilla, null, {
            //         table: { row: { cantSplit: true } },
            //         footer: true,
            //         pageNumber: true
            //     });

            //     fs.writeFile(filePath, fileBuffer, (error) => {
            //         if (error) {
            //             console.log(filePath, 'Docx file creation failed', error);
            //             reject(error);
            //         } else {
            //             const resOut = filePath.split("/public/");
            //             const docUrl = "http://".concat(urlserver).concat("/").concat(resOut[1]);
            //             resolve({"tipo": ctx.tipo.tipNombre, "documento": docUrl, "doc": ctx.tipo_documento});
            //         }
            //     });
            // })();   
        }
    });

    return promesa;
}
