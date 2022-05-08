var clientes = require('../controllers/clientes.server.controller');

module.exports = function(app) {
    app.route('/clientes/list').get(clientes.list);
    app.route('/clientes/create').post(clientes.create);
    app.route('/clientes/find/:id').get(clientes.findById);
    app.route('/clientes/listpop').get(clientes.listpop);
    app.route('/clientes/update').post(clientes.update);
    app.route('/clientes/delete/:_id').get(clientes.delete);
};