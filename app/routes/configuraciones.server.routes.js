var configuraciones = require('../controllers/configuraciones.server.controller');

module.exports = function(app) {
    app.route('/configuraciones/create').post(configuraciones.create);
    app.route('/configuraciones/listpop').get(configuraciones.listpop);
    app.route('/configuraciones/find/:id').get(configuraciones.findById);
    app.route('/configuraciones/findbydueno/:dueno').get(configuraciones.findByDueno);
    app.route('/configuraciones/update').post(configuraciones.update);
};