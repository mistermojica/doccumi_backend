const config = require('./config'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require("fs"),
    errHandler = require('../app/utils/errorHandler'),
    cookieParser = require("cookie-parser");

const cdkencmgr = require("../app/utils/encryptionManager");
const _ = require("underscore");
const cors = require("cors");

module.exports = function() {
    var app = express();
    app.use(express.static('public'));

    app.use(cors());

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    //app.use({ useNewUrlParser: true });

    // Use cookies to simulate logged in user.
    app.use(cookieParser());

    var requireEncription = false;

    if (requireEncription){

        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "*");
            res.header("Access-Control-Allow-Method", "*");
            if (req.method == 'OPTIONS'){
                res.sendStatus(200);
            }
            else {
                if (process.env.PORT == "8000"){
                    console.log("BODY REQUEST:", req.body);
                }

                if (typeof req.body.body != "undefined"){
                    if (req.url == "/referidores/create"){
                        req.body = cdkencmgr.decryptqr(req.body.body);
                    }
                    else {
                        if (process.env.PORT == "8000"){
                            console.log("DATA RECIBIDA ENC:", req.body);
                            console.log("DATA RECIBIDA DEC:", cdkencmgr.decrypt(req.body.body));
                        }
                        req.body = cdkencmgr.decrypt(req.body.body);
                    }
                }
                else {
                    if (req.method == 'POST'){
                        if (!req.url.includes("/socios/puedehacerlogin") && !req.url.includes("/dispositivos/deshabilitaapi")){
                            if (process.env.PORT != "8000"){
                                req.body = {};
                            }
                        }
                    }
                }

                var send = res.send;
                res.send = function (body) {
                    var bodyOut = {};
                    var bodyObj = JSON.parse(body);
                    if (req.url.includes("/referidores/create")){
                        bodyOut.body = cdkencmgr.encryptqr(JSON.parse(body));
                    }
                    else if (req.url.includes("/socios/autenticar")){
                        //var usuario = typeof bodyObj.result.usuario !== "undefined" ? bodyObj.result.usuario : typeof bodyObj.result.cedula !== "undefined" ? bodyObj.result.cedula : "";
                        bodyOut.body = cdkencmgr.encrypt(bodyObj);
                        if (process.env.PORT == "8000"){
                            console.log("DATA ENVIADA DEC:", body);
                        }
                        //bodyOut.body = bodyObj;
                    }
                    else if (req.url.includes("/dispositivos/deshabilitaapi")){
                        bodyOut = bodyObj;
                        if (process.env.PORT == "8000"){
                            console.log("DATA ENVIADA DEC:", bodyOut);
                        }
                    }
                    else {
                        if (process.env.PORT == "8000"){
                            console.log("DATA ENVIADA DEC:", body);
                            // console.log("DATA ENVIADA ENC:", cdkencmgr.encrypt(body));
                        }
                        //bodyOut.body = JSON.parse(body);
                        bodyOut.body = cdkencmgr.encrypt(JSON.parse(body));
                        //bodyOut.body = bodyObj;
                    }
                    send.call(this, JSON.stringify(bodyOut));
                };
                next();
            }
        });

    }

    //app.use(auth.authenticateToken);
    
    // app.use(authAPP.authenticateToken);

    // app.use(authBACKOFFICE.authenticateToken);

    //app.use(bodyParser.urlencoded({extended: true}));

    // app.use(bodyParser.json({limit: "50mb"}));

    // app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

    var routePath = "app/routes/"; //add one folder then put your route files there my router folder name is routers
    fs.readdirSync(routePath).forEach(function(file) {
        var route = '../' + routePath + file;
        //console.log("route:", route);
        require(route)(app);
    });

    console.log("\n======= Rutas Cargadas =======\n");

    // app.use(errHandler.ErrorHandler);

    return app;
};