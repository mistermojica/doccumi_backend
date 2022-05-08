var CryptoJS = require("crypto-js");

exports.encrypt = function (data) {
    var datacifrada = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.NODE_ENCRYPTION_SECRET_KEY).toString();
    return datacifrada;
}

exports.decrypt = function (datacifrada) {
    var databytes  = CryptoJS.AES.decrypt(datacifrada, process.env.NODE_ENCRYPTION_SECRET_KEY);
    var datadescifrada = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
    return datadescifrada;
}

exports.encryptqr = function (data) {
    var datacifrada = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.NODE_ENCRYPTION_SECRET_KEY_QR).toString();
    return datacifrada;
}

exports.decryptqr = function (datacifrada) {
    var databytes  = CryptoJS.AES.decrypt(datacifrada, process.env.NODE_ENCRYPTION_SECRET_KEY_QR);
    var datadescifrada = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
    return datadescifrada;
}

exports.encryptbackoffice = function (data) {
    var datacifrada = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.NODE_ENCRYPTION_SECRET_KEY_BACKOFFICE).toString();
    return datacifrada;
}

exports.decryptbackoffice = function (datacifrada) {
    var databytes  = CryptoJS.AES.decrypt(datacifrada, process.env.NODE_ENCRYPTION_SECRET_KEY_BACKOFFICE);
    var datadescifrada = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
    return datadescifrada;
}

exports.encryptapp = function (data) {
    var datacifrada = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.TOKEN_SECRET).toString();
    return datacifrada;
}

exports.decryptapp = function (datacifrada) {
    var databytes  = CryptoJS.AES.decrypt(datacifrada, process.env.TOKEN_SECRET);
    var datadescifrada = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
    return datadescifrada;
}

exports.encryptsha = function (data) {
    var datacifrada = CryptoJS.SHA512(JSON.stringify(data)).toString();
    return datacifrada;
}

exports.getDataFromHeader = function (dataType, headers){
    var dataTokenHeader = this.decryptbackoffice(headers['token']);
    var result = typeof dataTokenHeader[dataType] !== "undefined" ? dataTokenHeader[dataType] : "";
    return result;
}