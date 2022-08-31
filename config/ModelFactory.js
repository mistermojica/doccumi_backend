var mongoose = require("mongoose");
var models = [];
var conns = [];
var modelPath = "app/models";
var config = require("./config.json");
var fs = require("fs");
var v = require('voca');

module.exports = function factory(paramTenant) {
    mlCL("paramTenant", paramTenant);

    let tenantObj = 
        typeof config.Tenants[process.env.NODE_ENV][paramTenant] === "undefined" ? 
        config.Tenants[process.env.NODE_ENV][process.env.DEFAULTDB] : 
        config.Tenants[process.env.NODE_ENV][paramTenant];
    
    let dbName = tenantObj.dbName;
    let dbConnection = tenantObj.dbConfig;

    if (conns[dbName]) {
        //mlCL('ModelFactory || conns[' + dbName + ']', 'PRE-LOADED');
    }
    else {
        //mlCL('ModelFactory || conns[' + dbName + ']', 'NEW-LOADED');
        conns[dbName] = mongoose.createConnection(dbConnection);
    }

    if (models[dbName]) {
        //mlCL('ModelFactory || models[' + dbName + ']', 'PRE-LOADED');
    }
    else {
        //mlCL('ModelFactory || models[' + dbName + ']', 'NEW-LOADED');

        var instanceModels = [];

        fs.readdirSync(modelPath).forEach(function(file) {
            var fileSplit = file.split(".");
            var schemaName = v.capitalize(fileSplit[1]);
            var fileTenant = fileSplit[0];

            if (fileTenant == paramTenant){
                instanceModels[schemaName] = conns[dbName].model(schemaName); //[path, schemaUri].join("/")
            }
        });

        // DB name and tenant ID also pushing in the same object
        // instanceModels["tenantID"] = paramTenant;
        // instanceModels["db"] = conns[dbName];
        models[dbName] = instanceModels;
    }

    return models[dbName];
}

function mlCL(paramMsg, paramData){
    // console.log('\r\n==================');
    // console.log(paramMsg);
    // console.log('------------------');
    // console.log(paramData);
    // console.log('======================');
}