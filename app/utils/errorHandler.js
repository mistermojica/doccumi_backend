
exports.ErrorHandler = function (errm, req, res, next) {
    var result = {success: false, message: 'Ha ocurrido un error inesperado en la ejecución.', result: errm.toString()}
    return res.status(500).json(result);
}