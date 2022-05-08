var impresiones = require('../controllers/impresiones.server.controller');

module.exports = function(app) {
    app.route('/impresiones/create').post(impresiones.create);
};