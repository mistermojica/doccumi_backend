const HttpStatus = require("http-status-codes");
const mofac = require("../../config/ModelFactory");
const db = mofac("doccumi");
const entityName = "Usuario(s)";
const cdkencmgr = require("../utils/encryptionManager");
const jwt = require("jsonwebtoken");
const _ = require("underscore");
const strMgr = require("../utils/strManager");
const comMgr = require("../helpers/comunicaciones.server.helper");

exports.login = function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  req.body.usuario = req.body.usuario || req.body.email;
  req.body.contrasena = req.body.contrasena || req.body.password;

  console.log(req.body);

  db.Usuarios.findOne({
    $or: [{ usuario: req.body.email }, { usuario: req.body.usuario }],
  })
    .where("estado")
    .ne("borrado")
    .lean()
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
    .populate({
      path: "_estado_",
      select: "codigo nombre",
      match: { isActive: true },
    })
    .exec(function (err, entity) {
      if (err) {
        console.log(__filename + " >> .login: " + JSON.stringify(err));
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message:
              "Error inesperado al hacer login. Por favor intente nuevamente.",
            result: err,
          });
      } else {
        console.log(entity);

        if (!entity) {
          res
            .status(HttpStatus.FORBIDDEN)
            .json({
              success: false,
              message:
                "Usuario o Contraseña inválido. Favor intente nuevamente.",
              result: {},
            });
        } else if (entity) {
          if (entity.contrasena != req.body.contrasena) {
            // if (entity.contrasena != cdkencmgr.encryptsha(req.body.contrasena)) {
            res
              .status(HttpStatus.UNAUTHORIZED)
              .json({
                success: false,
                message:
                  "Usuario o Contraseña inválido. Favor intente nuevamente.",
                result: {},
              });
          } else {
            var dataObj = JSON.parse(JSON.stringify(entity));
            _generateToken(dataObj)
              .then((tokenRes) => {
                dataObj.token = tokenRes.result.token;
                dataObj.rolToken = cdkencmgr.encryptapp("usuario");
                res
                  .status(HttpStatus.OK)
                  .json({
                    success: true,
                    message: "Login realizado exitosamente.",
                    result: dataObj,
                  });
              })
              .catch((tokenErr) => {
                console.log("tokenErr:", tokenErr);
                res
                  .status(HttpStatus.BAD_REQUEST)
                  .json({
                    success: false,
                    message: "Error inesperado al generar el token de usuario.",
                    result: tokenErr,
                  });
              });
          }
        }
      }
    });
};

function _generateToken(ctx) {
  var promise = new Promise(function (resolve, reject) {
    var payload = {
      usuario: ctx.usuario,
      proveedor: "",
      empresa: "",
      empleado: "",
    };

    console.log("payload:", payload);

    var datatoken = cdkencmgr.encryptbackoffice(payload);

    var tokentime = {
      code: jwt.sign({ data: datatoken }, process.env.TOKEN_SECRET, {
        expiresIn: "1h",
      }),
      expires: { time: 1, type: "h" },
    };

    var ctxSave = {
      tokentime: tokentime.code,
      token: datatoken,
      usuario: ctx.usuario,
      tipo: "usuario",
      expira_tiempo: tokentime.expires.time,
      expira_medida: tokentime.expires.type,
      estado: "activo",
    };

    var result = {
      token: datatoken,
      expires: tokentime.expires,
    };

    var entity = new db.Tokentimes(ctxSave);
    entity.save(function (err) {
      if (err) {
        console.log(__filename + " >> .create: " + JSON.stringify(err));
        reject({
          success: false,
          message: `Error en la creación de Token de Usuario.`,
          result: {},
        });
      } else {
        resolve({
          success: true,
          message: `Token de Usuario generado exitosamente`,
          result: result,
        });
      }
    });
  });

  return promise;
}

exports.create = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  req.body.usuario = req.body.usuario || req.body.email;
  req.body.contrasena = req.body.contrasena || req.body.password;

  mlCL('req.body:', req.body);

  var entity = new db.Usuarios(req.body);
  entity.save(function (err) {
    if (err) {
      console.log(__filename + " >> .create: " + JSON.stringify(err));
      res.json({
        success: false,
        message: `Error en la creación de ${entityName}.`,
        result: err,
      });
    } else {
      createConfiguraciones({_id: entity._id}).then((resConf) => {
        console.log({resConf});
        res.json({
          success: true,
          message: `${entityName} se creó exitosamente.`,
          result: {
            profile: strMgr.e2o(entity),
            settings: strMgr.e2o(resConf)
          }
        });
      }).catch((errConf) => {
        console.log({errConf});
        res.json({
          success: false,
          message: `Error en la creación de ${entityName}.`,
          result: errConf,
        });
      });
    }
  });
};

function createConfiguraciones(ctx) {
  var promise = new Promise(function (resolve, reject) {

    var ctxSave = {
      conDueno: ctx._id,
      conIGUsuario: '',
      conIGContrasena: '',
      conFBUsuario: '',
      conFBContrasena: '',
      conSCUsuario: '',
      conSCContrasena: '',
      conEstado: 'activo'
    };

    console.log("ctxSave:", ctxSave);

    var entity = new db.Configuraciones(ctxSave);
    entity.save(function (err) {
      if (err) {
        console.log(__filename + " >> .createConfiguraciones: " + JSON.stringify(err));
        reject(err);
      } else {
        resolve(entity);
      }
    });
  });

  return promise;
}

exports.update = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Usuarios.findOne({ _id: req.body._id })
    .where("estado")
    .ne("borrado")
    .exec(function (err, entitydb) {
      if (err) {
        console.log(__filename + " >> .update: " + JSON.stringify(err));
        res.json({
          success: false,
          message: `Error al obtener ${entityName}.`,
          result: {},
        });
      } else {
        _.each(req.body, function (value, key) {
          if (key === "contrasena" && value !== ''){
            // entitydb.contrasena = cdkencmgr.encryptsha(req.body[key]);
            entitydb[key] = req.body[key];
          } else {
            if (key !== "contrasena"){
              entitydb[key] = req.body[key];
            }
          }
        });

        entitydb.fecha_modificacion = new Date();

        console.log({entitydb});

        entitydb.save(function (err) {
          if (err) {
            console.log(__filename + " >> .update: " + JSON.stringify(err));
            res.json({
              success: false,
              message: `Error en la actualización de ${entityName}.`,
              result: {},
            });
          } else {
            res.json({
              success: true,
              message: `${entityName} se actualizó exitosamente.`,
              result: entitydb,
            });
          }
        });
      }
    });
};

exports.list = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Usuarios.find({})
    .where("estado")
    .ne("borrado")
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .list: " + JSON.stringify(err));
        res.json({
          success: false,
          message: `Error en la lista de ${entityName}s.`,
          result: {},
        });
      } else {
        res.json({
          success: true,
          message: `Lista de ${entityName}s generada exitosamente.`,
          result: data,
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

  db.Usuarios.find({})
    .select("-__v")
    .where("estado")
    .ne("borrado")
    .lean()
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
    .populate({
      path: "_estado_",
      select: "codigo nombre",
      match: { isActive: true },
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findById: " + JSON.stringify(err));
        res.json({
          success: false,
          message: `Error al obtener ${entityName}.`,
          result: {},
        });
      } else {
        res.json({
          success: true,
          message: `Lista de ${entityName}s generada exitosamente.`,
          result: data,
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

  db.Usuarios.findOne({ _id: req.params.id })
    .select("-__v")
    .where("estado")
    .ne("borrado")
    .lean()
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
    .populate({
      path: "_estado_",
      select: "codigo nombre",
      match: { isActive: true },
    })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findById: " + JSON.stringify(err));
        res.json({
          success: false,
          message: `Error al obtener ${entityName}.`,
          result: {},
        });
      } else {
        res.json({
          success: true,
          message: `${entityName} se encontró exitosamente.`,
          result: data,
        });
      }
    });
};

exports.profile = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Usuarios.findOne({_id: req.params._id})
    .select("-__v")
    .where("estado")
    .ne("borrado")
    .lean()
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
    // .populate({
    //   path: "_estado_",
    //   select: "codigo nombre",
    //   match: { isActive: true },
    // })
    .exec(function (err, data) {
      if (err) {
        console.log(__filename + " >> .findById: " + JSON.stringify(err));
        res.json({
          success: false,
          message: `Error al obtener ${entityName}.`,
          result: {},
        });
      } else {
        getConfiguraciones({conDueno: req.params._id}).then((resConf) => {
          console.log({resConf});
          res.json({
            success: true,
            message: `${entityName} se encontró exitosamente.`,
            result: {
              profile: strMgr.e2o(data),
              settings: strMgr.e2o(resConf)
            }
          });
        }).catch((errConf) => {
          console.log({errConf});
          res.json({
            success: false,
            message: `Error en la búsqueda de ${entityName}.`,
            result: errConf,
          });
        });
      }
    });
};

function getConfiguraciones(ctx) {
  // console.log({ctx});

  var promise = new Promise(function (resolve, reject) {

    db.Configuraciones
    .findOne({conDueno: ctx.conDueno})
    .where("conEstado")
    .ne("borrado")
    .lean()
    // .populate({
    //   path: "_estado_",
    //   select: "codigo nombre",
    //   match: { isActive: true },
    // })
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

exports.recoverpassword = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  db.Usuarios.findOne({email: req.body.email})
  .select("nombre email")
  .where("estado")
  .ne("borrado")
  .lean()
  .exec(function (err, data) {
    if (err) {
      console.log(__filename + " >> .recoverpassword: " + JSON.stringify(err));
      res.json({
        status: 'NOTFOUND',
        message: `No reconocemos este correo electrónico.`,
        result: {},
      });
    } else {
      var token = {
        code: jwt.sign({ payload: cdkencmgr.encrypt({id: data._id}) }, process.env.TOKEN_SECRET, {
          expiresIn: "1h",
        }),
        expires: { time: 1, type: "h" },
      };

      console.log({token});

      const ctx = {
        to: data?.nombre.split(" ")[0] + " <" + data.email + ">",
        subject: "Restablecer tu contraseña",
        content: `<br><img height="30px" src="https://doccumi.com/wp-content/uploads/2022/08/logo-black-transp.png"><br><br><p style="font-family: Cereal,Helvetica,Arial,sans-serif; font-size: 18px;">Hola ${data?.nombre.split(" ")[0]},<br><br>Hemos recibido una solicitud para restablecer tu contraseña.<br><br>Si no realizaste la solicitud, simplemente ignora este mensaje. De lo contrario, puedes restablecer tu contraseña.<br><br><a style="background-color: #007bff; border-color: #007bff; color: white; text-align: center; text-decoration: none; display: inline-block; font-size: 18px; padding-top: 10px; padding-bottom: 10px; padding-left: 15px; padding-right: 15px; margin: 4px 2px; border-radius: 4px;" href="${req.headers.origin}/recover-password?id=${token.code}">Restablecer tu contraseña</a><br><br>Gracias,<br><br>El equipo de DOCCUMI</p>`
      }

      comMgr.sendEmail(ctx);

      res.json({
        status: "SUCCESS",
        message: `Hemos enviado un enlace para restablecer tu contraseña a la dirección ${req.body.email}`,
        data: {}
      });
    }
  });
}

exports.resetpassword = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log("body:", req.body);

  jwt.verify(req.body.id, process.env.TOKEN_SECRET, (err, data) => {
    if (err) {
      res.status(HttpStatus.FORBIDDEN).json({status: 'ERROR', message: 'El enlace de recuperación de contraseña es incorrecto o está vencido.', code: "999", data: {}});
    } else {
      const payload = cdkencmgr.decrypt(data.payload);

      db.Usuarios.findOne({_id: payload.id})
      .where("estado")
      .ne("borrado")
      .exec(function (err, entitydb) {
        if (err) {
          console.log(__filename + " >> .resetpassword: " + JSON.stringify(err));
          res.json({
            status: 'ERROR',
            message: `Este ${entityName} no existe.`,
            result: {},
          });
        } else {
          // entitydb.contrasena = cdkencmgr.encryptsha(req.body.password);
          entitydb.contrasena = req.body.password;
          entitydb.fecha_modificacion = new Date();
          entitydb.save(function (err) {
            if (err) {
              console.log(__filename + " >> .resetpassword: " + JSON.stringify(err));
              res.json({
                status: "ERROR",
                message: `Error en la recuperación de la contraseña, por favor contacte al administrador.`,
                result: {},
              });
            } else {
              res.json({
                status: "SUCCESS",
                message: `Contraseña restaurada exitosamente.`,
                result: entitydb,
              });
            }
          });
        }
      });
    }
  });
};

function mlCL(paramMsg, paramData) {
  console.log('\r\n==================');
  console.log(paramMsg);
  console.log('\r\n');
  console.log(paramData);
  console.log('======================');
}
