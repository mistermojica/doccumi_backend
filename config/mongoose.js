var config = require('./config');
var mongoose = require('mongoose');
var fs = require("fs");
var dbConfig = require('../config/config.json');

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

module.exports = function() {
    var db = mongoose.connect(dbConfig.Tenants[process.env.NODE_ENV][process.env.DEFAULTDB].dbConfig);
    
    var modelPath = "app/models/";
    fs.readdirSync(modelPath).forEach(function(file) {
        var model = '../' + modelPath + file;
        //console.log("model:", model);
        require(model);
    });
    console.log("\n======= Modelos Cargados =======\n");

    return db;
};