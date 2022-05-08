require('dotenv').config();
require('events').EventEmitter.prototype._maxListeners = 200;
// process.env.NODE_ENV = process.env.NODE_ENV || 'production'; //production //development

//require('./config/bootstrap');
var mongoose      = require('./config/mongoose');
var db 			  = mongoose();
var express 	  = require('./config/express');
var app           = express();
var bodyParser    = require("body-parser");
var morgan 		  = require('morgan');
const { encryptsha, decrypt, encrypt } = require('./app/utils/encryptionManager');

module.exports = app;

const server = require('http').createServer(app);
var port = process.env.PORT;
server.listen(port);

console.log("Backend App Empleados CRUD Up and Running on port: " + port + "!\r\n");